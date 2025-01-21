from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from knox import views as knox_views

from .views.register import RegisterView
from .views.login import LoginView
from .views.user import UserDetailView, UserSettingsView, UserProfileView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="knox_logoutall"),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("user/settings/", UserSettingsView.as_view(), name="user-settings"),
    path("user/profile/", UserProfileView.as_view(), name="user-profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
