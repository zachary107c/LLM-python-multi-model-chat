from django.contrib import admin
from django.urls import path, include
from . import views


urlpatterns = [
    path("", views.Index.as_view(), name="index"),
    path("conversations/", views.ConversationListCreateView.as_view(), name="conversations"),
    path("conversations/<str:pk>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<str:pk>/like", views.ConversationDetailView.as_view(), name="conversation-like"),
    path("messages/user/", views.UserListCreateView.as_view(), name="user-messages"),
    path("messages/user/<int:pk>/", views.UserMessageDetailView.as_view(), name="user-message-detail"),
    path("messages/assistant/", views.AssistantListCreateView.as_view(), name="assistant-messages"),
    path("messages/assistant/<int:pk>/", views.AssistantMessageDetailView.as_view(), name="assistant-message-detail"),
    path("messages/assistant/<int:pk>/like", views.AssistantMessageDetailView.as_view(), name="assistant-message-like"),
    path("models/", views.OllamaModelListCreateView.as_view(), name="models"),
    path("models/<int:pk>/", views.OllamaModelDetailView.as_view(), name="model-detail"),
    path("models/<int:pk>/like", views.OllamaModelDetailView.as_view(), name="model-like"),
]
