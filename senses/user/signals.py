from django.db.models.signals import post_save, post_delete
from .models import User, Profile


def delete_user(sender, instance, **kwargs):
    user = instance.user_id
    user.delete()

def create_profile(sender, instance, created, **kwargs):
    if created:
        user = instance
        username = user.email.split('@')[0]
        profile = Profile.objects.create(
            user_id=user,
            username = username
        )

post_save.connect(create_profile, sender=User)
post_delete.connect(delete_user, sender=Profile)