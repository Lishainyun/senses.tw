from rest_framework import serializers
from user.models import User, Profile
from story.models import Story, Story_Photo, Comment, Comment_Photo
from datetime import datetime

class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

class UserSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'date_joined', 'is_npo']

class ProfileSerializer(DynamicFieldsModelSerializer):
    self_stories = serializers.SerializerMethodField(method_name="get_self_stories")
    class Meta:
        model = Profile
        fields = '__all__'
    def get_self_stories(self, obj):
        stories = obj.story_set.all().order_by('-time')[0:11]
        serializer = StorySerializer(stories, many=True, fields=('id', 'user', 'time', 'modified_time', 
                                                                'comments', 'upvote_total', 'text', 'image'))
        return serializer.data

class CommentSerializer(DynamicFieldsModelSerializer):
    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    time = serializers.SerializerMethodField(method_name="get_formatted_datetime")
    modified_time = serializers.SerializerMethodField(method_name="get_formatted_datetime")

    class Meta:
        model = Comment
        fields = ('id', 'user', 'comment', 'time', 'modified_time', 'upvote', 'text')
    def get_formatted_datetime(self, obj):
        return obj.time.strftime('%Y/%m/%d %H:%M:%S')

class StoryPhotoSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Story_Photo
        fields = '__all__'

class StorySerializer(DynamicFieldsModelSerializer):
    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    time = serializers.SerializerMethodField(method_name="get_formatted_datetime")
    modified_time = serializers.SerializerMethodField(method_name="get_formatted_datetime")
    photos = serializers.SerializerMethodField(method_name="get_photos")
    comments = serializers.SerializerMethodField(method_name="get_comments")
    

    class Meta:
        model = Story
        fields = '__all__'

    def get_formatted_datetime(self, obj):
        return obj.time.strftime('%Y/%m/%d %H:%M:%S')

    def get_comments(self, obj):
        comments = obj.comment_set.all().order_by('time')[0:11]
        serializer = CommentSerializer(comments, many=True)
        return serializer.data

    def get_photos(self, obj):
        photos = obj.story_photo_set.all()
        serializer = StoryPhotoSerializer(photos, many=True)
        return serializer.data

