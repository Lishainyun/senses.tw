from django import forms
from django.shortcuts import render
from main.models import Main
from .models import Profile, ProfileManager
from .forms import RegisterForm

def profile_entry_view(request):

    sitename = Main.objects.get(pk=1).name

    return render(request, 'profileEntry.html', {'sitename':sitename})

def profile_view(request, username):

    sitename = Main.objects.get(pk=1).name

    return render(request, 'profile.html', {'sitename':sitename, 'username':username})


def register_view(request):

    sitename = Main.objects.get(pk=1).name
    success_registered_message = ""

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            success_registered_message = "註冊成功！"
            form.save()
    else:
        form = RegisterForm()
    
    context = {'form': form, 'sitename': sitename, 'success_registered_message': success_registered_message}

    return render(request, 'register.html', context)

def login_view(request):
    
    sitename = Main.objects.get(pk=1).name

    return render(request, 'login.html', {'sitename':sitename})
