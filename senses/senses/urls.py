from django.contrib import admin
from django.urls import re_path, include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    
    re_path(r'^admin/', admin.site.urls),
    re_path(r'', include('main.urls')),
    re_path(r'^user/', include('user.urls')),
    re_path(r'^stories/', include('story.urls')),
    re_path(r'^api/', include('api.urls'))

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)