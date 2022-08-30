from django.urls import re_path, include
from . import views

urlpatterns = [
    
    re_path(r'$', views.home, name='home'),
    re_path(r'^setting/$', views.setting, name='setting'),

]