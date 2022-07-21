from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from user.models import User, Profile
from story.models import Story, Story_Photo, Comment, Comment_Photo
from .serializers import UserSerializer, ProfileSerializer, StorySerializer, CommentSerializer

from senses.settings import SECRET_KEY
import jwt, datetime


@api_view(['GET'])
def get_users_list(request):

    if request.method == 'GET':
        try:  
            users = User.objects.all()
            serializer = UserSerializer(users, many=True)

            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)

@api_view(['GET'])
def get_user(request, pk):

    if request.method == 'GET':
        try:
            user = User.objects.get(id=pk)
            serializer = UserSerializer(user, many=False)

            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)

@api_view(['GET'])
def get_profile(request, username):
    try:
        profile = Profile.objects.get(username=username)
        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data, 200)
    except:
        error = {"error": True, 
                "message": "Something went wrong."}
        return Response(error, 400)

@api_view(['PATCH'])
def patch_profile(request):
    
    if request.method == 'PATCH':
        try:
            data = request.data
            token = data['token']
            user_id = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])['user_id']

            profile = Profile.objects.get(user_id=user_id)
            serializer = ProfileSerializer(profile, many=False)

            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)


    # else if request.method == 'DELETE':
    #     try:

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

        if len(images) != 0:
            for image in images:
                print(image)
                img = Story_Photo.objects.create(story=story, url=image, name=image.name)
                

        success = {"success": True, "message": "Add story successfully."}
        return Response(success, 200)

    except:
        error = {"error": True, "message": "Something went wrong."}
        return Response(error, 400)

@api_view(['GET'])
def get_stories_list(request):

    if request.method == 'GET':
        try:
            stories = Story.objects.all().order_by('-time')[0:11]
            serializer = StorySerializer(stories, many=True)

            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_story(request, pk):

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
        original_filename = request_data.getlist('originalFilename')
        time = datetime.datetime.now()

        try:
            story = Story.objects.get(pk=story_id)
            story.text = text
            story.save()

            story_photo_name = [photo['name'] for photo in Story_Photo.objects.filter(story=story).values('name')]
            wati_for_delete_photos = [name for name in story_photo_name if name not in original_filename]
            for photo in wati_for_delete_photos:
                Story_Photo.objects.filter(story=story).get(name=photo).delete()
            print('delete photo success')
                
            if len(imagefile) != 0:
                for image in imagefile:
                    img = Story_Photo.objects.create(story=story, url=image, name=image.name)
                    

            success = {"success": True, "message": "edit story successfully."}
            return Response(success, 200)

        except:
            error = {"error": True, "message": "Something went wrong."}
            return Response(error, 400)


@api_view(['GET'])
def get_comments(request):

    if request.method == 'GET':
        try:
            comments = Comment.objects.all().order_by('-time')[0:11]
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, 200)
        except:
            error = {"error": True, 
                    "message": "Something went wrong."}
            return Response(error, 400)


