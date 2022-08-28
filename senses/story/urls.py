from django.urls import re_path
from .views import stories_view, single_story_view

urlpatterns = [
    re_path(r'$', stories_view, name='stories'),
    re_path(r'(?P<pk>\S+)/$', single_story_view, name='single_story_view'),
]

