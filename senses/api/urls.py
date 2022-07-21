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
    
    re_path(r'^user/profile/$', views.patch_profile, name='patch_profile'),
    re_path(r'^user/profile/(?P<username>\S+)/$', views.get_profile, name='get_profile'),
    
    
    re_path(r'^stories/$', views.get_stories_list, name='get_stories'),
    re_path(r'^story/(?P<pk>\S+)/$', views.get_story, name='get_story'),
    re_path(r'^stories/add/$', views.add_story, name='add_story'),

    re_path(r'^comments/$', views.get_comments, name='get_comments'),
    # re_path(r'^comment/(?P<pk>\S+)/$', views.get_comment, name='get_comment'),

]