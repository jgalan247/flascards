from django.contrib import admin
from .models import Teacher, Subject, Deck, Card


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('name', 'email', 'password')
        }),
        ('Info', {
            'fields': ('created_at',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if 'password' in form.changed_data:
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


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
