from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _
from django import forms
from .models import User

class RegisterForm(UserCreationForm):
    
    email = forms.EmailField(
        label=_('電子信箱'),
        widget=forms.EmailInput(attrs={'autocomplete':'email'}),
        error_messages={
            'invalid':'請輸入有效電子信箱',
            'required':'尚未輸入電子信箱'
        }
    )

    password1 = forms.CharField(
        label=_('密碼'),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete':'new-password'}),
        error_messages={'required':'尚未輸入密碼'},
    )

    password2 = forms.CharField(
        label=_('確認密碼'),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplte':'new-password'}),
        error_messages={'required':'尚未輸入確認密碼'}
    )

    error_messages = {
        'password_mismatch':_('確認密碼輸入錯誤')
    }

    class Meta:

        model = User
        fields = ('email', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            user = User.objects.get(email=email)
        except Exception as e:
            return email
        raise forms.ValidationError(f'{email} 已被註冊')



                