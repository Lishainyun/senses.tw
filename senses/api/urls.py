from django.urls import re_path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    re_path(r'user/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    re_path(r'user/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),

    re_path(r'^users/$', views.get_users_list, name='get_users'),
    re_path(r'^user/(?P<pk>\d+)/$', views.get_user, name='user_detail'),
    
    re_path(r'^user/profile/$', views.login_profile, name='login_profile'),
    re_path(r'^user/profiles/$', views.edit_profile, name='edit_profile'),
    re_path(r'^user/profile/(?P<username>\S+)/$', views.get_profile, name='get_profile'),
    
    
    re_path(r'^stories/$', views.get_stories_list, name='get_stories'),
    re_path(r'^story/(?P<pk>\S+)/$', views.handle_single_story, name='handle_single_story'),
    re_path(r'^stories/add/$', views.add_story, name='add_story'),

    re_path(r'^comments/$', views.get_comments_list, name='get_comments_list'),
    re_path(r'^comment/(?P<pk>\S+)/$', views.delete_comment, name='delete_comment'),
    re_path(r'^comments/add/$', views.add_comment, name='add_comment'),

    re_path(r'^likes/$', views.get_likes_list, name='get_likes_list'),
    re_path(r'^like/$', views.handle_single_like, name='handle_single_like'),
    re_path(r'^likes/add/$', views.add_like, name='add_like'),

    re_path(r'^follows/$', views.get_follows_list, name='get_follows_list'),
    re_path(r'^follow/$', views.handle_single_follow, name='handle_single_follow'),
    re_path(r'^follows/add/$', views.add_follow, name='add_follow'),
    
]