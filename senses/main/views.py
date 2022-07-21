from django.shortcuts import render, get_object_or_404, redirect
from .models import Main

# Create your views here

def home(request):

    sitename = Main.objects.get(pk=1).name

    return render(request, 'main/home.html', {'sitename':sitename})

def setting(request):
    
    sitename = Main.objects.get(pk=1).name

    return render(request, 'main/setting.html', {'sitename':sitename})
