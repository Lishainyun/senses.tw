import redis 
import os 
import logging
import json
import datetime
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from user.models import Follow
from story.models import Like
from .serializers import (
    FollowSerializer,
    LikeSerializer,
)
from redis.commands.json.path import Path


REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD')
redis_client = redis.Redis(host='127.0.0.1', port=6379, db=0, password=REDIS_PASSWORD)

def follows_list(follower, following):

    # follower's
    lookup = (Q(follower__username=follower) | Q(following__username=follower))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')
    
    follower_data = {
        "followerData": {
            "followerList": [],
            "length": 0, 
        },
        "followingData": {
            "followingList": [],
            "length": 0,
        },
    }    

    if follow.exists():

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
    redis_client.json().set(follows_key, Path.root_path().json.dumps(follower_data))
    redis_client.expire(follows_key, datetime.timedelta(days=1))
    print('follows_key: ', follows_key)

    # following's

    following_data = {
        "followerData": {
            "followerList": [],
            "length": 0, 
        },
        "followingData": {
            "followingList": [],
            "length": 0,
        },
    }    

    lookup = (Q(follower__username=following) | Q(following__username=following))
    follow = Follow.objects.select_related('follower').select_related('following').filter(lookup).order_by('-time')

    if follow.exists():

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
    redis_client.json().set(follows_key, Path.root_path(), json.dumps(following_data))
    redis_client.expire(follows_key, datetime.timedelta(days=1))

    print('follows_key: ', follows_key)


def unfollow(follower, following, username):

    follow = Follow.objects.select_related('follower').filter(
        follower__username=follower
        ).select_related('following').get(
            following__username=following
            )

    follow.delete()
    follows_list(follower, following)
