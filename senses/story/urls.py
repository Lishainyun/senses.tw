from django.urls import re_path
from .views import stories_view

urlpatterns = [
    re_path(r'$', stories_view, name='stories'),
]

