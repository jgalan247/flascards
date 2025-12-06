from django import forms
from django.contrib import admin
from .models import Teacher, Subject, Deck, Card


class TeacherAdminForm(forms.ModelForm):
    new_password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        help_text='Enter a new password to change it. Leave blank to keep current password.'
    )

    class Meta:
        model = Teacher
        fields = ['name', 'email']

    def save(self, commit=True):
        teacher = super().save(commit=False)
        new_password = self.cleaned_data.get('new_password')
        if new_password:
            teacher.set_password(new_password)
        if commit:
            teacher.save()
        return teacher


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    form = TeacherAdminForm
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('name', 'email')
        }),
        ('Change Password', {
            'fields': ('new_password',),
            'description': 'Enter a new password to reset it. Leave blank to keep the current password.'
        }),
        ('Info', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher')
    search_fields = ('name', 'teacher__name')
    list_filter = ('teacher',)


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'is_public', 'created_at')
    search_fields = ('title', 'slug', 'teacher__name')
    list_filter = ('is_public', 'subject', 'teacher')
    readonly_fields = ('slug', 'created_at', 'updated_at')
    prepopulated_fields = {}


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('short_question', 'deck', 'order')
    search_fields = ('question', 'answer', 'deck__title')
    list_filter = ('deck',)

    def short_question(self, obj):
        return obj.question[:50] + '...' if len(obj.question) > 50 else obj.question
    short_question.short_description = 'Question'
