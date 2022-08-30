from django import forms
from django.shortcuts import render
from main.models import Main
from .models import Story

def stories_view(request):

    sitename = Main.objects.get(pk=1).name

    return render(request, 'story.html', {'sitename':sitename})

def single_story_view(request, pk):

    return render(request, 'singleStory.html')