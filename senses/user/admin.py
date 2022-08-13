from django.contrib import admin
from .models import User, UserManager, Profile, Follow

admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Follow)