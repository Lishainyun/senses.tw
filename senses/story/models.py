from __future__ import unicode_literals
from django.db import models
from django.db.models.signals import post_save
from django.core.validators import FileExtensionValidator
from django.utils import timezone
from user.models import User, Profile
import uuid



class Story(models.Model):
    
    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    time = models.DateTimeField(default=timezone.now, editable=False)
    modified_time = models.DateTimeField(null=True, blank=True)
    text = models.TextField(max_length=5000)

    def __str__(self):
        return str(self.id)

    class Meta:
        db_table = 'story'


def set_story_photo_upload_path(instance, filename):
    return f'images/story/{instance.story}/{filename}'

class Story_Photo(models.Model):

    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    time = models.DateTimeField()
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    url = models.ImageField(blank=True, null=True, upload_to=set_story_photo_upload_path, 
                        validators=[FileExtensionValidator(
                        allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])])
    def __str__(self):
        return str(self.url).split('/')[-1]

    class Meta:
        db_table = 'Story_Photo'

class Comment(models.Model):
    
    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    story_id = models.ForeignKey(Story, on_delete=models.CASCADE, default=False, null=True, blank=True)
    comment_id = models.ForeignKey('self', on_delete=models.CASCADE, default=False, null=True, blank=True, related_name="comment_comment")
    time = models.DateTimeField(default=timezone.now, editable=False)
    modified_time = models.DateTimeField(null=True, blank=True)  
    text = models.TextField(max_length=5000, null=True, blank=True)
    tag_username = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        db_table = 'comment'

def set_comment_photo_upload_path(instance, filename):
    return f'images/story/{instance.id}/{filename}'

class Comment_Photo(models.Model):

    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    time = models.DateTimeField()
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    url = models.ImageField(blank=True, null=True, upload_to=set_comment_photo_upload_path, 
                        validators=[FileExtensionValidator(
                        allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])])
    
    def __str__(self):
        return str(self.url).split('/')[-1]

    class Meta:
        db_table = 'Comment_Photo'

class Like(models.Model):

    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    time = models.DateTimeField(default=timezone.now, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, default=False, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, default=False, null=True, blank=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        db_table = 'Like'



