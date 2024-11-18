from . import views
from django.urls import path
from django.conf import settings
from knox import views as knox_views
from django.conf.urls.static import static


urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="knox_logoutall"),
    path("user/", views.UserDetailView.as_view(), name="user-detail"),
    path("user/settings/", views.UserSettingsView.as_view(), name="user-settings"),
    path("user/profile/", views.UserProfileView.as_view(), name="user-profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
