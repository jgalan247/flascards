import re
from rest_framework import serializers
from .models import Teacher, Subject, Deck, Card


def validate_password_strength(password):
    """
    Validate password meets security requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    errors = []

    if len(password) < 8:
        errors.append('Password must be at least 8 characters long.')

    if not re.search(r'[A-Z]', password):
        errors.append('Password must contain at least one uppercase letter.')

    if not re.search(r'[a-z]', password):
        errors.append('Password must contain at least one lowercase letter.')

    if not re.search(r'\d', password):
        errors.append('Password must contain at least one number.')

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).')

    if errors:
        raise serializers.ValidationError(errors)

    return password


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'question', 'answer', 'order']


class DeckSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    display_author = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'slug', 'subject', 'subject_name',
            'teacher', 'teacher_name', 'exam_board', 'year_group',
            'target_grade', 'created_by', 'display_author', 'created_at', 'updated_at', 'is_public', 'cards'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'teacher']

    def get_display_author(self, obj):
        # Return custom created_by if set, otherwise teacher name
        return obj.created_by if obj.created_by else obj.teacher.name


class DeckListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views (no cards)"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    card_count = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            'id', 'title', 'slug', 'subject', 'subject_name',
            'exam_board', 'year_group', 'target_grade',
            'created_at', 'updated_at', 'is_public', 'card_count'
        ]

    def get_card_count(self, obj):
        return obj.cards.count()


class DeckCreateSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True)
    subject_name = serializers.CharField(write_only=True, required=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), required=False)

    class Meta:
        model = Deck
        fields = [
            'title', 'subject', 'subject_name', 'exam_board',
            'year_group', 'target_grade', 'is_public', 'cards'
        ]

    def create(self, validated_data):
        cards_data = validated_data.pop('cards')
        subject_name = validated_data.pop('subject_name', None)
        validated_data.pop('subject', None)  # Remove subject if passed, we'll use subject_name

        # Get teacher from context
        teacher = getattr(self.context.get('request'), 'teacher', None)
        if not teacher:
            raise serializers.ValidationError({'error': 'Authentication required'})

        # Create or get subject from name
        if subject_name:
            subject, _ = Subject.objects.get_or_create(
                name=subject_name,
                teacher=teacher
            )
            validated_data['subject'] = subject
        else:
            raise serializers.ValidationError({'subject_name': 'Subject is required'})

        deck = Deck.objects.create(teacher=teacher, **validated_data)

        for idx, card_data in enumerate(cards_data):
            # Remove order if present, use idx instead
            card_data.pop('order', None)
            Card.objects.create(deck=deck, order=idx, **card_data)

        return deck


class SubjectSerializer(serializers.ModelSerializer):
    deck_count = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'deck_count']

    def get_deck_count(self, obj):
        return obj.decks.count()


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'name', 'email', 'created_at']
        read_only_fields = ['created_at']


class TeacherRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Teacher
        fields = ['name', 'email', 'password']

    def validate_password(self, value):
        return validate_password_strength(value)

    def create(self, validated_data):
        teacher = Teacher(
            name=validated_data['name'],
            email=validated_data['email']
        )
        teacher.set_password(validated_data['password'])
        teacher.save()
        return teacher


class TeacherLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
