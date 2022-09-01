from django.http import HttpResponse, QueryDict
from django.db.models import Prefetch, Count, Q
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from user.models import User, Profile, Follow
from story.models import Story, Story_Photo, Comment, Comment_Photo, Like
from .serializers import (
    UserSerializer, 
    ProfileSerializer, 
    StorySerializer, 
    StoryPhotoSerializer, 
    SavedStorySerializer,
    CommentSerializer, 
    CommentPhotoSerializer,
    LikeSerializer,
    FollowSerializer,
)

from senses.settings import SECRET_KEY
from . import utils
import logging, jwt, datetime, json, redis, os

REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')
redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, password=REDIS_PASSWORD)

@api_view(['GET'])
def get_users_list(request):

    try:  
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)

        return Response(serializer.data, 200)
    except:
        error = {"error": True, 
                "message": "Request failed."}
        return Response(error, 400)

@api_view(['GET'])
def get_user(request, pk):

    try:
        user = User.objects.get(id=pk)
        serializer = UserSerializer(user, many=False)

        return Response(serializer.data, 200)
    except:
        error = {"error": True, 
                "message": "Request failed."}
        return Response(error, 400)

@api_view(['GET'])
def get_profile(request, username):
    
    profile_key = f'{username}_profile'
    redis_cached_data = redis_client.get(profile_key)

    if redis_cached_data is not None:

        data = json.loads(redis_cached_data)

        print('Successfully get data from redis')
        return Response(data, 200)
    
    else:

        try:
            profile = Profile.objects.get(username=username)
            serializer = ProfileSerializer(profile, many=False)
            data = serializer.data

            # cache
            redis_client.set(profile_key, json.dumps(data))
            redis_client.expire(profile_key, datetime.timedelta(days=1))
            print('Successfully set data into redis')
            
            return Response(data, 200)

        except:
            error = {"error": True, "message": "Request failed."}
            return Response(error, 400)


@api_view(['PATCH'])
def login_profile(request):
    
    try:
        data = request.data
        token = data['token']
        user_id = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])['user_id']
        profile = Profile.objects.get(user_id=user_id)
        serializer = ProfileSerializer(profile, many=False)
        
        return Response(serializer.data, 200)
    except:
        error = {"error": True, 
                "message": "Request failed."}
        return Response(error, 400)


@api_view(['PATCH'])
def edit_profile(request):
    
    try:
        plaintext_data = request.POST

        user_id = plaintext_data['userId']
        username = plaintext_data['username']
        intro = plaintext_data['intro']
        bio = plaintext_data['bio']
        
        profile = Profile.objects.get(user_id=user_id)

        if username:
            profile.username = username

        if intro:
            profile.intro = intro
        
        if bio:
            profile.bio = bio
 
        bg_list = request.FILES.getlist('bg')
        if len(bg_list) != 0:
            bg = request.FILES.getlist('bg')[0]
            profile.background_image = bg

        avatar_list = request.FILES.getlist('avatar')
        if len(avatar_list) != 0:
            avatar = request.FILES.getlist('avatar')[0]
            profile.avatar = avatar

        profile.save()

        serializer = ProfileSerializer(profile, many=False)
        data = serializer.data

        # cache
        profile_key = f'{username}_profile'
        redis_client.set(profile_key, json.dumps(data))
        redis_client.expire(profile_key, datetime.timedelta(days=1))

        return Response({'success': True, 'data': data}, 200)
    except:
        error = {"error": True, 
                "message": "Request failed."}
        return Response(error, 400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_story(request):

    request_data = request.POST
    user_id = request_data['userId']
    text = request_data['text']
    images = request.FILES.getlist("image")
    time = datetime.datetime.now()

    try:
        user = Profile.objects.get(pk=user_id)
        story = Story.objects.create(user=user, text=text, time=time)
        story.modified_time = time
        story.save()

        if len(images) != 0:
            for image in images:
                print(image, story, time)
                img = Story_Photo.objects.create(story=story, url=image, time=time)
                
        success = {"success": True, "message": "Add story successfully."}
        return Response(success, 200)

    except:
        error = {"error": True, "message": "Request failed."}
        return Response(error, 400)

@api_view(['GET', 'PATCH'])
def get_stories_list(request):

    page = request.GET.get('page')
    keyword = request.GET.get('keyword')
    user_id = request.GET.get('user')
    current_location = request.GET.get('currentLocation')    
    current_location_username = request.GET.get('currentLocationUsername')    

    if request.method == 'GET':
        if page and (keyword == "") :

            offset = int(page) * 12
            next_page = int(page) + 1

            try: 

                if current_location == 'story':
                    stories = Story.objects.all().order_by('-time')[offset:offset+13]
                else:
                    stories = Story.objects.select_related('user').filter(user__username=current_location_username).all().order_by('-time')[offset:offset+13]

                result_length = len(stories)
                serializer = StorySerializer(stories[0:12], many=True)

                if user_id != 'undefined':
                    all_selected_stories_id_set = set([story['id'] for story in serializer.data])
                    all_currentuser_likes_story_id_set = set([str(story) for story in list(
                                                    Like.objects.select_related('story')
                                                    .select_related('user__user_id')
                                                    .filter(user__user_id__id=user_id)
                                                    .values_list('story', flat=True)
                                                    )])

                    selectedStoriesIdListOfcurrentUserLikes = list(all_currentuser_likes_story_id_set.intersection(
                                                                        all_selected_stories_id_set
                                                                    ))                                
                else:
                    selectedStoriesIdListOfcurrentUserLikes = ""


                if result_length >= 13:

                    return Response({'nextPage': next_page, 'data':serializer.data, 
                                    'selectedStoriesIdListOfcurrentUserLikes': selectedStoriesIdListOfcurrentUserLikes}, 200)
                    
                elif result_length < 13:

                    return Response({'nextPage': None, 'data':serializer.data,
                                    'selectedStoriesIdListOfcurrentUserLikes': selectedStoriesIdListOfcurrentUserLikes}, 200)

                else:

                    return Response({'error': True, 'message':'There is no page requested.'}, 400)

            except:

                return Response({"error": True, "message": "Request failed."}, 400)

        else:

            try: 
                selected_story = ""
                story_result = Story.objects.filter(pk=keyword).exists()
                
                if(story_result):
                    selected_story = Story.objects.get(pk=keyword)
                    
                else:
                    selected_comment_storyId = Comment.objects.get(pk=keyword).story_id.id
                    selected_story = Story.objects.get(pk=selected_comment_storyId)

                serializer = StorySerializer(selected_story, many=False)

                if user_id != 'undefined':
                    selected_story_id = set([keyword])
                    all_currentuser_likes_story_id_set = set([str(story) for story in list(
                                                    Like.objects.select_related('story')
                                                    .select_related('user__user_id')
                                                    .filter(user__user_id__id=user_id)
                                                    .values_list('story', flat=True)
                                                    )])

                    selectedStoriesIdListOfcurrentUserLikes = list(all_currentuser_likes_story_id_set.intersection(
                                                                        selected_story_id
                                                                    ))
                                                        
                else:
                    selectedStoriesIdListOfcurrentUserLikes = ""

                return Response({'nextPage': None, 'data':serializer.data, 
                                'selectedStoriesIdListOfcurrentUserLikes': selectedStoriesIdListOfcurrentUserLikes}, 200)

            except:

                return Response({"error": True, "message": "Request failed."}, 400)

    
    else:
        data = json.loads(request.body)['followings']
        stories = []

        current_datetime = timezone.now()
        time_limit = current_datetime - datetime.timedelta(days=1)

        try:
            for following in data:

                lookup = (Q(user__user_id=following) & Q(time__gte=time_limit))

                story = Story.objects.select_related('user').filter(lookup).order_by('-time')

                serializer = StorySerializer(story, many=True)
                stories.append(serializer.data)
            
            return Response({'success': True, 'data': stories}, 200)   
            
        except:

            return Response({'error': True, 'message': 'Failed retrieving stories of following users.'}, 200)   



@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def handle_single_story(request, pk):

    if request.method == 'GET':
        try:
            story = Story.objects.filter(id=pk)
            serializer = StorySerializer(story, many=True)
            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)

    elif request.method == 'PATCH':

        request_data = request.POST
        story_id = pk
        text = request_data['text']
        imagefile = request.FILES.getlist("imagefile")
        original_file_id = request_data.getlist('originalFileId')
        time = datetime.datetime.now()

        try:
            story = Story.objects.get(pk=story_id)
            story.text = text
            story.modified_time = time
            story.save()

            story_photo_id = [str(photo['id']) for photo in Story_Photo.objects.filter(story=story).values('id')]
            wati_for_delete_photos = [str(id) for id in story_photo_id if id not in original_file_id]

            for photo in wati_for_delete_photos:
                Story_Photo.objects.filter(story=story).get(id=photo).delete()
                
            if len(imagefile) != 0:
                for image in imagefile:
                    img = Story_Photo.objects.create(story=story, url=image, time=time)
                    

            success = {"success": True, "message": "edit story successfully."}
            return Response(success, 200)

        except:
            error = {"error": True, "message": "Something went wrong."}
            return Response(error, 400)
    
    else:
        try:
            story = Story.objects.filter(id=pk)
            story.delete()
            return Response({"success": True}, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)

@api_view(['GET', 'PATCH'])
def get_comments_list(request):

    story_id = request.GET.get('storyId')
    comment_id = request.GET.get('commentId')

    if story_id and (comment_id is None) :

        page = int(request.GET.get('page'))

        offset = page * 12
        next_page = page + 1

        try:

            story = Story.objects.get(pk=story_id)
            comments_selected = Comment.objects.select_related('story_id').filter(story_id__id=story_id).order_by('time')[offset:offset+13]
            comments_selected_length = len(comments_selected)
            serializer = CommentSerializer(comments_selected, many=True)

            comments_num = [Comment.objects.filter(comment_id=comment).aggregate(Count('id'))['id__count'] for comment in comments_selected]
            likes_num = [Like.objects.filter(comment=comment).aggregate(Count('id'))['id__count'] for comment in comments_selected]
                
            if comments_selected_length > 12:

                return Response({
                                'nextPage': next_page, 
                                'storyId':story_id, 
                                'data':serializer.data[0:12], 
                                'commentsNum': comments_num[0:12],
                                'likesNum': likes_num[0:12],
                                }, 200)

            elif comments_selected_length <= 12:

                return Response({
                                'nextPage': None, 
                                'storyId':story_id, 
                                'data':serializer.data,
                                'commentsNum': comments_num,
                                'likesNum': likes_num,
                                }, 200)

            else:

                return Response({'error': True, 'message':'There is no page requested.'}, 400)

        except:

            return Response({"error": True, "message": "Request failed."}, 400)

    elif (story_id is None) and comment_id: 
        
        page = int(request.GET.get('page'))

        offset = page * 12
        next_page = page + 1

        try:

            comments_selected = Comment.objects.select_related('comment_id').filter(comment_id__id=comment_id).order_by('time')[offset:offset+13]
            comments_selected_length = len(comments_selected)

            serializer = CommentSerializer(comments_selected, many=True)

            likes_num = [Like.objects.filter(comment=comment).aggregate(Count('id'))['id__count'] for comment in comments_selected]

            if comments_selected_length > 12:

                return Response({'nextPage': next_page, 
                                'commentId': comment_id,
                                'commentsNum': comments_selected_length,
                                'likesNum': likes_num,
                                'data':serializer.data,
                                }, 200)

            elif comments_selected_length <= 12:

                return Response({'nextPage': None, 
                                'commentId':comment_id, 
                                'commentsNum': comments_selected_length,
                                'likesNum': likes_num,                                     
                                'data':serializer.data,
                                }, 200)

            else:

                return Response({'error': True, 'message':'There is no page requested.'}, 400)

        except:

            return Response({"error": True, "message": "Request failed."}, 400)

    elif (story_id is None) and (comment_id is None): 

        data = json.loads(request.body)['followings']
        comments = []

        current_datetime = timezone.now()
        time_limit = current_datetime - datetime.timedelta(days=1)

        try:
            for following in data:

                lookup = (Q(user__user_id=following) & Q(time__gte=time_limit))

                comment = Comment.objects.select_related('user').filter(lookup).order_by('-time')

                serializer = CommentSerializer(comment, many=True)
                comments.append(serializer.data)
            
            return Response({'success': True, 'data': comments}, 200)   
            
        except:

            return Response({'error': True, 'message': 'Failed retrieving comments of following users.'}, 200)          

    else: 

        return Response({"error": True, "message": "Only take one parameter."}, 400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):

    request_data = request.POST

    time = datetime.datetime.now()
    user_id = request_data['userId']
    image = request.FILES.getlist('image')
    text = request_data['text']
    tag_username = request_data['tagUsername']

    story_comment_id_pair = json.loads(request_data['storyCommentIdPair'])

    if story_comment_id_pair['storyId']:
        try:
            story_id = story_comment_id_pair['storyId']
            user = Profile.objects.get(pk=user_id)
            story = Story.objects.get(pk=story_id)
            comment = Comment.objects.create(
                story_id=story,
                comment_id=None,
                tag_username=None,
                user=user,
                text=text, 
                time=time, 
                modified_time=time
            )

            if image:
                img = Comment_Photo.objects.create(comment=comment, time=time, url=image[0])

            success = {"success": True, "message": "Add comment successfully."}
            return Response(success, 200)

        except:
            error = {"error": True, "message": "Request failed."}
            return Response(error, 400)

    else:
        comment_id = story_comment_id_pair['commentId']

        try:
            user = Profile.objects.get(pk=user_id)
            selected_comment = Comment.objects.get(pk=comment_id)
            comment = Comment.objects.create(
                comment_id=selected_comment,
                story_id=None,
                tag_username=tag_username,
                user=user,
                text=text, 
                time=time, 
                modified_time=time
            )

            if image:
                img = Comment_Photo.objects.create(comment=comment, time=time, url=image[0])

            success = {"success": True, "message": "Add comment successfully."}
            return Response(success, 200)

        except:
            error = {"error": True, "message": "Request failed."}
            return Response(error, 400)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, pk):

    try:
        comment = Comment.objects.get(id=pk)
        comment.delete()
        return Response({"success": True}, 200)
    except:
        error = {"error": True, 
                "message": "Something went wrong."}
        return Response(error, 400)    


@api_view(['GET'])
def get_likes_list(request):

    story_id = request.GET.get('storyId')
    comment_id = request.GET.get('commentId')
    page = request.GET.get('page')
    user_id = request.GET.get('userId')


    if story_id:

        offset = int(page) * 12
        next_page = int(page) + 1

        try:

            story = Story.objects.get(pk=story_id)
            likes_selected = Like.objects.select_related('story').filter(story__id=story_id).order_by('time')[offset:offset+13]
            likes_selected_length = len(likes_selected)
            serializer = LikeSerializer(likes_selected, many=True)
                
            if likes_selected_length > 12:

                return Response({
                                'nextPage': next_page, 
                                'storyId':story_id, 
                                'data':serializer.data[0:12], 
                                }, 200)

            elif likes_selected_length <= 12:

                return Response({
                                'nextPage': None, 
                                'storyId':story_id, 
                                'data':serializer.data,
                                }, 200)

            else:

                return Response({'error': True, 'message':'There is no page requested.'}, 400)

        except:

            return Response({"error": True, "message": "Request failed."}, 400)

    elif comment_id: 

        offset = int(page) * 12
        next_page = int(page) + 1

        try:

            likes_selected = Like.objects.select_related('comment').filter(comment__id=comment_id).order_by('time')[offset:offset+13]
            likes_selected_length = len(likes_selected)
            serializer = LikeSerializer(likes_selected, many=True)

            if likes_selected_length > 12:

                return Response({'nextPage': next_page, 
                                'commentId': comment_id,
                                'data':serializer.data[0:12], 
                                }, 200)

            elif likes_selected_length <= 12:

                return Response({'nextPage': None, 
                                'commentId':comment_id,                          
                                'data':serializer.data,
                                }, 200)

            else:

                return Response({'error': True, 'message':'There is no page requested.'}, 400)

        except:

            return Response({"error": True, "message": "Request failed."}, 400)

    elif user_id: 

        user_likeslist_key = f'{user_id}_likeslist'
        redis_cached_data = redis_client.get(user_likeslist_key)

        if redis_cached_data is not None:

            data = json.loads(redis_cached_data)

            print('get user_likeslist from redis')
            return Response({"success": True, "data": data}, 200)

        else:

            try:

                likes = Like.objects.select_related('user').filter(user__user_id=int(user_id))
                serializer = LikeSerializer(likes, many=True)
                data = serializer.data

                user_likeslist_key = f'{user_id}_likeslist'
                redis_client.set(user_likeslist_key, json.dumps(data))
                redis_client.expire(user_likeslist_key, datetime.timedelta(days=1))

                return Response({"success": True, "data": data}, 200)

            
            except ObjectDoesNotExist:

                error = {"error": True, 
                        "message": "User is not exists."}

                return Response(error, 400)
    else: 

        return Response({"error": True, "message": "Necessary parameters not given."}, 400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_like(request):

    request_data = json.loads(request.body)

    time = datetime.datetime.now()
    user_id = request_data["userId"]
    story_id = request_data["storyId"]
    comment_id = request_data["commentId"]

    try:

        like = Like.objects.create(
            time=time,
            user_id=user_id,
            story_id=story_id,
            comment_id=comment_id
        )

        serializer = LikeSerializer(like, many=False)
        data = serializer.data

        # renew cache
        utils.get_user_likeslist(user_id)  

        success = {"success": True, "message": "Add like successfully.", "data": data}
        return Response(success, 200)

    except:
        error = {"error": True, "message": "Request failed."}
        return Response(error, 400)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def handle_single_like(request):

    story_id = request.GET.get('storyId')
    comment_id = request.GET.get('commentId')
    user_id = int(request.GET.get('userId'))

    if request.method == 'GET':
        try:
            like = Like.objects.select_related('story').filter(story__id=story_id).select_related('user').get(user__user_id=user_id)
            serializer = LikeSerializer(like, many=False)
            return Response({"success": True, "data": serializer.data}, 200)

        except ObjectDoesNotExist:
            error = {"error": True, 
                    "message": "The user has not liked this story yet."}
            return Response(error, 400)
    
    else:
        try:
            if story_id != "null":

                utils.delete_like(story_id, user_id)

                return Response({"success": True, "message": "Delete like successfully."}, 200)

            else:

                utils.delete_like(comment_id, user_id)
                
                return Response({"success": True, "message": "Delete like successfully."}, 200)

        except:
            error = {"error": True, "message": "Deleting like failed."}
            return Response(error, 400)

@api_view(['GET'])
def get_follows_list(request):

    username = request.GET.get('user')

    follows_key = f'{username}_follows'
    redis_cached_data = redis_client.get(follows_key)

    if redis_cached_data is not None:

        data = json.loads(redis_cached_data)

        return Response({"success": True, "data": data}, 200)

    else:

        try: 
            
            lookup = (Q(follower__username=username) | Q(following__username=username))
            follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

            serializer = FollowSerializer(follow, many=True)
            all_data = serializer.data

            follower_list = [dict(dict(data)['follower']) for data in all_data if dict(dict(data)['following'])['username'] == username]
            following_list = [dict(dict(data)['following']) for data in all_data if dict(dict(data)['follower'])['username'] == username]

            follower_list_length = len(follower_list)
            following_list_length = len(following_list)
            
            data = {
                "followerData": {
                    "followerList": follower_list,
                    "length": follower_list_length, 
                },
                "followingData": {
                    "followingList": following_list,
                    "length": following_list_length,
                },
            }
            
            # cache
            follows_key = f'{username}_follows'
            redis_client.set(follows_key, json.dumps(data))
            redis_client.expire(follows_key, datetime.timedelta(days=1))
            
            return Response({"success": True, "data": data}, 200)

        except:

            return Response({"error": True, "message": "Request failed."}, 400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_follow(request):

    request_data = json.loads(request.body)

    follower = request_data["follower"]
    following = request_data["following"]
    username = request_data["username"]
    time = datetime.datetime.now()

    try:

        follow = Follow.objects.create(
            time=time,
        )

        follower = Profile.objects.get(username=follower)
        follow.follower = follower

        following = Profile.objects.get(username=following)
        follow.following = following

        follow.save()

        serializer = FollowSerializer(follow, many=False)
        data = serializer.data

        # cache
        utils.get_follows_list(follower, following)      

        success = {"success": True, "message": "Follow successfully.", "data": data}
        return Response(success, 200)

    except:
        error = {"error": True, "message": "Request failed."}
        return Response(error, 400)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def handle_single_follow(request):

    follower = request.GET.get('follower')
    following = request.GET.get('following')
    username = request.GET.get('username')


    if request.method == 'GET':
        try:
            follow = Follow.objects.select_related('follower').filter(
                follower__username=follower
                ).select_related('following').get(
                    following__username=following
                    )

            serializer = FollowSerializer(follow, many=False)
            return Response({"success": True, "data": serializer.data}, 200)

        except ObjectDoesNotExist:
            error = {"error": True, 
                    "message": "The user has not followed this user yet."}
            return Response(error, 400)
    
    else:
        try:

            utils.unfollow(follower, following, username)

            return Response({"success": True, "message": "Unfollow successfully."}, 200)


        except:
            error = {"error": True, "message": "Deleting like failed."}
            return Response(error, 400)