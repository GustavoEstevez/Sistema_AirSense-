from django.contrib import admin
from django.urls import path, include
from Api.views import Home, HomeAI, HomeBeta, historial, documentacion

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HomeAI, name='HomeAI'),
    path('clasico/', Home, name='Home'),
    path('nueva/', HomeBeta, name='HomeBeta'),
    path('dashboard/', include('core.urls', namespace='dashboard')),
    path('historial/', historial, name='historial'),
    path('documentacion/',documentacion, name='documentacion'),
]