# Generated by Django 4.0.4 on 2022-08-28 20:23

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('story', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment_photo',
            name='url',
            field=models.ImageField(blank=True, null=True, upload_to='', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])]),
        ),
        migrations.AlterField(
            model_name='story_photo',
            name='url',
            field=models.ImageField(blank=True, null=True, upload_to='', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])]),
        ),
    ]
