# Generated by Django 4.0.4 on 2022-08-29 16:19

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_alter_profile_avatar_alter_profile_background_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='avatar',
            field=models.ImageField(blank=True, default='/profile/default.png', null=True, upload_to='', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])]),
        ),
        migrations.AlterField(
            model_name='profile',
            name='background_image',
            field=models.ImageField(blank=True, default='/profile/bg-default.png', null=True, upload_to='', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['tiff', 'tif', 'bmp', 'jpg', 'jpeg', 'gif', 'png', 'eps'])]),
        ),
    ]
