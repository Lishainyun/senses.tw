from django.urls import re_path
from .views import profile_entry_view, profile_view, register_view, login_view

urlpatterns = [
    re_path(r'^profile/', profile_view, name='profile'),
    re_path(r'^register/$', register_view, name='register'),
    re_path(r'^login/$', login_view, name='login'),
]

