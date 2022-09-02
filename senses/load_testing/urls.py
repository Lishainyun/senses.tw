from django.urls import re_path
from .views import loadtest

urlpatterns = [
    re_path(r'$', loadtest, name='loadtest'),
]

