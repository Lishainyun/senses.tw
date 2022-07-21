from django.contrib import admin
from .models import Story, Story_Photo, Comment, Comment_Photo

admin.site.register(Story)
admin.site.register(Story_Photo)
admin.site.register(Comment)
admin.site.register(Comment_Photo)