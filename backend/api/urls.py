from django.urls import path

from .views.index import Index
from .views.conversation import ConversationListCreateView, ConversationDetailView
from .views.user_message import UserMessageListCreateView, UserMessageDetailView
from .views.assistant_message import AssistantMessageListCreateView, AssistantMessageDetailView
from .views.model import ModelListCreateView, ModelDetailWithInfoView, ModelsPopulateAPIView
from .views.chat import ChatAPIView, StreamChatAPIView
from .views.three_suggestions import ThreeSuggestionsAPIView
from .views.tool import ToolsListCreateView, ToolsDetailView
from .views.magic_title import MagicTitleAPIView


urlpatterns = [
    path("", Index.as_view(), name="index"),
    path("conversations/", ConversationListCreateView.as_view(), name="conversations"),
    path("conversations/<str:pk>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("messages/user/", UserMessageListCreateView.as_view(), name="user-messages"),
    path("messages/user/<int:pk>/", UserMessageDetailView.as_view(), name="user-message-detail"),
    path("messages/assistant/", AssistantMessageListCreateView.as_view(), name="assistant-messages"),
    path("messages/assistant/<int:pk>/", AssistantMessageDetailView.as_view(), name="assistant-message-detail"),
    path("models/", ModelListCreateView.as_view(), name="models"),
    path("models/<int:pk>/", ModelDetailWithInfoView.as_view(), name="models"),
    path("models/populate/", ModelsPopulateAPIView.as_view(), name="models-populate"),
    path("chat/", ChatAPIView.as_view(), name="chat"),
    path("chat/stream/", StreamChatAPIView.as_view(), name="chat-stream"),
    path("suggestions/", ThreeSuggestionsAPIView.as_view(), name="suggestions"),
    path("tools/", ToolsListCreateView.as_view(), name="tools"),
    path("tools/<str:pk>/", ToolsDetailView.as_view(), name="tools-detail"),
    path("magic", MagicTitleAPIView.as_view(), name="magic-title")
]
