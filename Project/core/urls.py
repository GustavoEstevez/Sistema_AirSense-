from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('',                    views.home,                name='home'),
    path('data/',               views.data,                name='data'),
    path('sensor/datos/',       views.recibir_datos,       name='recibir_datos'),
    path('enviar-correo/',      views.enviar_correo_manual, name='enviar_correo'),
    path('alerta-ingreso/',     views.alerta_al_ingresar,   name='alerta_ingreso'),
]