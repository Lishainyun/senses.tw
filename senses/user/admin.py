from django.contrib import admin
from .models import User, UserManager, Profile

admin.site.register(User)
admin.site.register(Profile)