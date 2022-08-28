from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid


class UserManager(BaseUserManager):

    def create_user(self, email, password=None):

        if not email:
            raise ValueError('請輸入電子郵件信箱')

        user = self.model(
            email=self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None):

        user = self.create_user(
            email, 
            password=password,
        )

        user.is_admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):

    email = models.EmailField(unique=True, db_index=True,)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    is_npo = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDs = ['email']

    def __str__(self):
        return self.email
    
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

class ProfileManager():
    pass

def set_profile_avatar_upload_path(instance, filename):
    return f'images/profile/avatar/{instance.user_id}/{filename}'

def set_profile_bg_upload_path(instance, filename):
    return f'images/profile/background/{instance.user_id}/{filename}'

class Profile(models.Model):

    user_id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    username = models.CharField(max_length=100, default="使用者名稱", db_index=True,)
    intro = models.CharField(max_length=200, blank=True, null=True, default="尚未填寫簡介")
    bio = models.TextField(blank=True, null=True, default="尚未填寫自我介紹")
    avatar = models.ImageField(null=True, blank=True, upload_to=set_profile_avatar_upload_path, 
                            validators=[FileExtensionValidator(allowed_extensions=['tiff','tif','bmp','jpg','jpeg','gif','png','eps'])],
                            default='images/profile/default.png')
    background_image = models.ImageField(null=True, blank=True, upload_to=set_profile_bg_upload_path, 
                            validators=[FileExtensionValidator(allowed_extensions=['tiff','tif','bmp','jpg','jpeg','gif','png','eps'])],
                            default='images/profile/bg-default.png')
    
    def __str__(self):
        return self.user_id.email

class Follow(models.Model):

    id = models.UUIDField(default=uuid.uuid4, unique=True, 
                          primary_key=True, editable=False)
    time = models.DateTimeField(default=timezone.now, editable=False)
    follower = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='follow_follower', blank=True, null=True)
    following = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='follow_following', blank=True, null=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        db_table = 'Follow'