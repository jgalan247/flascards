from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404

from .models import Teacher, Subject, Deck, Card
from .serializers import (
    TeacherSerializer, TeacherRegisterSerializer, TeacherLoginSerializer,
    SubjectSerializer, DeckSerializer, DeckListSerializer, DeckCreateSerializer,
    CardSerializer
)


class LoginRateThrottle(AnonRateThrottle):
    """Rate limit for login attempts: 5 per minute"""
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    """Rate limit for registration: 3 per hour"""
    scope = 'register'


class AuthView(APIView):
    """Handle teacher authentication"""

    def get_throttles(self):
        if self.kwargs.get('action') == 'login':
            return [LoginRateThrottle()]
        elif self.kwargs.get('action') == 'register':
            return [RegisterRateThrottle()]
        return []

    def post(self, request, action=None):
        if action == 'register':
            return self.register(request)
        elif action == 'login':
            return self.login(request)
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

    def register(self, request):
        serializer = TeacherRegisterSerializer(data=request.data)
        if serializer.is_valid():
            teacher = serializer.save()
            request.session['teacher_id'] = teacher.id
            return Response({
                'message': 'Registration successful',
                'teacher': TeacherSerializer(teacher).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def login(self, request):
        serializer = TeacherLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                teacher = Teacher.objects.get(email=email)
                if teacher.check_password(password):
                    request.session['teacher_id'] = teacher.id
                    return Response({
                        'message': 'Login successful',
                        'teacher': TeacherSerializer(teacher).data
                    })
                else:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Teacher.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_current_teacher(request):
    """Get currently logged in teacher"""
    teacher_id = request.session.get('teacher_id')
    if teacher_id:
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            return Response(TeacherSerializer(teacher).data)
        except Teacher.DoesNotExist:
            pass
    return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout(request):
    """Log out current teacher"""
    request.session.flush()
    return Response({'message': 'Logged out successfully'})


class SubjectViewSet(viewsets.ModelViewSet):
    serializer_class = SubjectSerializer

    def get_queryset(self):
        teacher_id = self.request.session.get('teacher_id')
        if teacher_id:
            return Subject.objects.filter(teacher_id=teacher_id)
        return Subject.objects.none()

    def perform_create(self, serializer):
        teacher_id = self.request.session.get('teacher_id')
        if teacher_id:
            teacher = Teacher.objects.get(id=teacher_id)
            serializer.save(teacher=teacher)


class DeckViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return DeckListSerializer
        elif self.action == 'create':
            return DeckCreateSerializer
        return DeckSerializer

    def get_queryset(self):
        # For retrieve action (public deck viewing), allow any public deck
        if self.action == 'retrieve':
            return Deck.objects.filter(is_public=True)

        # For other actions, require authentication
        teacher_id = self.request.session.get('teacher_id')
        if teacher_id:
            return Deck.objects.filter(teacher_id=teacher_id)
        return Deck.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        teacher_id = self.request.session.get('teacher_id')
        if teacher_id:
            try:
                context['request'].teacher = Teacher.objects.get(id=teacher_id)
            except Teacher.DoesNotExist:
                pass
        return context

    def create(self, request, *args, **kwargs):
        teacher_id = request.session.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        teacher_id = request.session.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        deck = self.get_object()
        if deck.teacher_id != teacher_id:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        teacher_id = request.session.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        deck = self.get_object()
        if deck.teacher_id != teacher_id:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['put'])
    def update_cards(self, request, slug=None):
        """Update cards for a deck"""
        teacher_id = request.session.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        deck = self.get_object()
        if deck.teacher_id != teacher_id:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete existing cards and create new ones
        deck.cards.all().delete()

        cards_data = request.data.get('cards', [])
        for idx, card_data in enumerate(cards_data):
            Card.objects.create(
                deck=deck,
                question=card_data.get('question', ''),
                answer=card_data.get('answer', ''),
                order=idx
            )

        return Response(DeckSerializer(deck).data)


@api_view(['GET'])
def public_deck(request, slug):
    """Get a public deck by slug (no auth required)"""
    deck = get_object_or_404(Deck, slug=slug, is_public=True)
    return Response(DeckSerializer(deck).data)
