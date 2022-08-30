from rest_framework import serializers
from user.models import User, Profile, Follow
from story.models import Story, Story_Photo, Comment, Comment_Photo, Like
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

    class Meta:
        model = Profile
        fields = '__all__'

class CommentPhotoSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Comment_Photo
        fields = '__all__'

class CommentSerializer(DynamicFieldsModelSerializer):
    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    time = serializers.SerializerMethodField(method_name="get_formatted_time_datetime")
    modified_time = serializers.SerializerMethodField(method_name="get_formatted_modified_timedatetime")
    photos = serializers.SerializerMethodField(method_name="get_photos")

    class Meta:
        model = Comment
        fields = ('id', 'user', 'time', 'modified_time', 'photos', 'text', 'tag_username')

    def get_formatted_time_datetime(self, obj):
        return obj.time.strftime('%Y/%m/%d %H:%M:%S')

    def get_formatted_modified_timedatetime(self, obj):
        return obj.modified_time.strftime('%Y/%m/%d %H:%M:%S')

    def get_photos(self, obj):
        photos = obj.comment_photo_set.all()
        serializer = CommentPhotoSerializer(photos, many=True)
        return serializer.data

class StoryPhotoSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Story_Photo
        fields = '__all__'

class StorySerializer(DynamicFieldsModelSerializer):
    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    time = serializers.SerializerMethodField(method_name="get_formatted_time_datetime")
    modified_time = serializers.SerializerMethodField(method_name="get_formatted_modified_timedatetime")
    photos = serializers.SerializerMethodField(method_name="get_photos")
    comments_num = serializers.SerializerMethodField(method_name="get_comments_num")
    likes_num = serializers.SerializerMethodField(method_name="get_likes_num")
    
    class Meta:
        model = Story
        fields = '__all__'

    def get_formatted_time_datetime(self, obj):
        return obj.time.strftime('%Y/%m/%d %H:%M:%S')

    def get_formatted_modified_timedatetime(self, obj):
        return obj.modified_time.strftime('%Y/%m/%d %H:%M:%S')

    def get_photos(self, obj):
        photos = obj.story_photo_set.all()
        serializer = StoryPhotoSerializer(photos, many=True, fields=('id', 'url',))
        return serializer.data

    def get_comments_num(self, obj):
        comments_num = obj.comment_set.all().count()
        return comments_num

    def get_likes_num(self, obj):
        likes_num = obj.like_set.all().count()
        return likes_num
      
class LikeSerializer(DynamicFieldsModelSerializer):

    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    story = StorySerializer(many=False, fields=('id', ))
    comment = CommentSerializer(many=False, fields=('id', ))

    class Meta:
        model = Like
        fields = '__all__'
      
class FollowSerializer(DynamicFieldsModelSerializer):

    time = serializers.SerializerMethodField(method_name="get_formatted_time_datetime")
    follower = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    following = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))

    class Meta:
        model = Follow
        fields = '__all__'

    def get_formatted_time_datetime(self, obj):
        return obj.time.strftime('%Y/%m/%d %H:%M:%S')

class SavedStorySerializer(DynamicFieldsModelSerializer):

    user = ProfileSerializer(many=False, fields=('user_id', 'username', 'avatar'))
    story = StorySerializer(many=False)

    class Meta:
        model = Like
        fields = '__all__'