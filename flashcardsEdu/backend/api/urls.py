from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'decks', views.DeckViewSet, basename='deck')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.AuthView.as_view(), {'action': 'register'}, name='register'),
    path('auth/login/', views.AuthView.as_view(), {'action': 'login'}, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/me/', views.get_current_teacher, name='current-teacher'),
    path('study/<slug:slug>/', views.public_deck, name='public-deck'),
]
