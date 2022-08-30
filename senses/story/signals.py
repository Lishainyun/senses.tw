from django.db.models.signals import post_delete
from models import Story_Photo, Comment_Photo

@receiver(models.signals.post_delete, sender=Story_Photo)
def remove_story_photos_from_s3(sender, instance, using, **kwargs):
    instance.img.delete(save=False)

@receiver(models.signals.post_delete, sender=Comment_Photo)
def remove_comment_photos_from_s3(sender, instance, using, **kwargs):
    instance.img.delete(save=False)