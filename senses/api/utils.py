from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from user.models import Follow
from story.models import Like
from .serializers import (
    FollowSerializer,
    LikeSerializer,
)

import redis, os, logging, json, datetime

REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')
redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, password=REDIS_PASSWORD)

def get_follows_list(follower, following):

    # follower's
    lookup = (Q(follower__username=follower) | Q(following__username=follower))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

    serializer = FollowSerializer(follow, many=True)
    all_data = serializer.data

    follower_list = [dict(dict(data)['follower']) for data in all_data if dict(dict(data)['following'])['username'] == follower]
    following_list = [dict(dict(data)['following']) for data in all_data if dict(dict(data)['follower'])['username'] == follower]

    follower_list_length = len(follower_list)
    following_list_length = len(following_list)
    
    follower_data = {
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
    follows_key = f'{follower}_follows'
    redis_client.set(follows_key, json.dumps(follower_data))
    redis_client.expire(follows_key, datetime.timedelta(days=1))

    # following's
    lookup = (Q(follower__username=following) | Q(following__username=following))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

    serializer = FollowSerializer(follow, many=True)
    all_data = serializer.data

    follower_list = [dict(dict(data)['follower']) for data in all_data if dict(dict(data)['following'])['username'] == following]
    following_list = [dict(dict(data)['following']) for data in all_data if dict(dict(data)['follower'])['username'] == following]

    follower_list_length = len(follower_list)
    following_list_length = len(following_list)
    
    following_data = {
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
    follows_key = f'{following}_follows'
    redis_client.set(follows_key, json.dumps(following_data))
    redis_client.expire(follows_key, datetime.timedelta(days=1))

def unfollow(follower, following, username):

    follow = Follow.objects.select_related('follower').filter(
        follower__username=follower
        ).select_related('following').get(
            following__username=following
            )
            
    follow.delete()

    # return follower's
    lookup = (Q(follower__username=follower) | Q(following__username=follower))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

    serializer = FollowSerializer(follow, many=True)
    all_data = serializer.data

    follower_list = [dict(dict(data)['follower']) for data in all_data if dict(dict(data)['following'])['username'] == follower]
    following_list = [dict(dict(data)['following']) for data in all_data if dict(dict(data)['follower'])['username'] == follower]

    follower_list_length = len(follower_list)
    following_list_length = len(following_list)
    
    follower_data = {
        "followerData": {
            "followerList": follower_list,
            "length": follower_list_length, 
        },
        "followingData": {
            "followingList": following_list,
            "length": following_list_length,
        },
    }

    #return following's
    lookup = (Q(follower__username=following) | Q(following__username=following))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

    serializer = FollowSerializer(follow, many=True)
    all_data = serializer.data

    follower_list = [dict(dict(data)['follower']) for data in all_data if dict(dict(data)['following'])['username'] == following]
    following_list = [dict(dict(data)['following']) for data in all_data if dict(dict(data)['follower'])['username'] == following]

    follower_list_length = len(follower_list)
    following_list_length = len(following_list)
    
    following_data = {
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
    follower_key = f'{follower}_follows'
    following_key = f'{following}_follows'
    redis_client.set(follower_key, json.dumps(follower_data))
    redis_client.set(following_key, json.dumps(following_data))
    redis_client.expire(follows_key, datetime.timedelta(days=1))
    redis_client.expire(following_key, datetime.timedelta(days=1))

# def get_user_likeslist(user_id):
    
#     try:

#         likes = Like.objects.select_related('user').filter(user__user_id=int(user_id))
#         serializer = LikeSerializer(likes, many=True)
#         data = serializer.data

#         user_likeslist_key = f'{user_id}_likeslist'
#         redis_client.set(user_likeslist_key, json.dumps(data))
#         redis_client.expire(user_likeslist_key, datetime.timedelta(days=1))

#         logging.basicConfig(filename='log/info.log', level=logging.INFO)
#         logging.info('Set new get_user_likeslist cached after withdrawing like.')

    
#     except ObjectDoesNotExist:

#         logging.basicConfig(filename='log/debug.log', level=logging.DEBUG)
#         logging.debug('Failed setting new get_user_likeslist cached after withdrawing like.')

# def delete_like(object_id, user_id):
    
#     try:

#         like = Like.objects.select_related('story').filter(story__id=object_id).select_related('user').get(user__user_id=user_id)
        
#         if like is None:
#             like = Like.objects.select_related('comment').filter(comment__id=object_id).select_related('user').get(user__user_id=user_id)
        
#         like.delete()        

#         likes = Like.objects.select_related('user').filter(user__user_id=int(user_id))
#         serializer = LikeSerializer(likes, many=True)
#         data = serializer.data

#         user_likeslist_key = f'{user_id}_likeslist'
#         redis_client.set(user_likeslist_key, json.dumps(data))
#         redis_client.expire(user_likeslist_key, datetime.timedelta(days=1))

#         logging.basicConfig(filename='log/info.log', level=logging.INFO)
#         logging.info('Successfully delete like and set new get_user_likeslist cached after withdrawing like.')

    
#     except ObjectDoesNotExist:

#         logging.basicConfig(filename='log/debug.log', level=logging.DEBUG)
#         logging.debug('Failed deleting like and setting new get_user_likeslist cached after withdrawing like.')