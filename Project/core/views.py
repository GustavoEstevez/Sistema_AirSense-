import json
import threading

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.shortcuts import render

from .alert_monitor import process_alert_cycle, process_alert_on_entry
from .email_service import send_email
from .metrics import is_unhealthy

# Última lectura recibida del ESP32 (se actualiza vía POST /sensor/datos/)
# BORRAR LOS PUSE COMO PRUEBA PARA VERIFICAR
ultimo_dato = {
    'temperatura': -10,
    'humedad':     -5,
    'ruido':       85,
    'co2':         1500,
    'estado':      'ok',
}
# BORRAR LOS PUSE COMO PRUEBA PARA VERIFICAR — volver a: ultimo_dato = None

def home(request):
    """Renderiza la página principal del dashboard en vivo."""
    return render(request, 'core/dashboard.html')


def data(request):
    """Devuelve la última lectura de sensores en JSON para el polling del front."""
    if not ultimo_dato:
        return JsonResponse({'error': 'Sin datos aún'}, status=503)
    return JsonResponse(ultimo_dato)


@csrf_exempt
def recibir_datos(request):
    """
    Endpoint POST que recibe lecturas del ESP32.

    Al guardar datos nuevos, dispara la evaluación de alertas por correo
    si el ambiente pasó a «No Saludable».
    """
    global ultimo_dato
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            ultimo_dato = {
                'temperatura': datos.get('temperatura'),
                'humedad':     datos.get('humedad'),
                'ruido':       datos.get('ruido'),
                'co2':         datos.get('co2'),
                'estado':      'ok',
            }
            threading.Thread(target=process_alert_cycle, daemon=True).start()
            return JsonResponse({'status': 'ok'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)


@csrf_exempt
@require_POST
def alerta_al_ingresar(request):
    """
    Dispara alerta al abrir el dashboard.

    Solo envía correo si el ambiente actual es «No Saludable»; si no, responde sin enviar.
    """
    if not ultimo_dato:
        return JsonResponse({'ok': True, 'enviado': False, 'mensaje': 'Sin datos de sensores todavía.'})

    if not is_unhealthy(ultimo_dato):
        return JsonResponse({
            'ok': True,
            'enviado': False,
            'mensaje': 'El ambiente no está en estado No Saludable.',
        })

    ok, mensaje = process_alert_on_entry()
    status = 200 if ok else 500
    return JsonResponse({'ok': ok, 'enviado': ok, 'mensaje': mensaje}, status=status)


@csrf_exempt
@require_POST
def enviar_correo_manual(request):
    """
    Envía las lecturas actuales al correo ingresado por el usuario en el dashboard.

    Body JSON esperado: { "email": "usuario@ejemplo.com" }
    """
    if not ultimo_dato:
        return JsonResponse({'ok': False, 'mensaje': 'Sin datos de sensores todavía.'}, status=503)

    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'ok': False, 'mensaje': 'JSON inválido.'}, status=400)

    destinatario = (payload.get('email') or '').strip()
    if not destinatario or '@' not in destinatario:
        return JsonResponse({'ok': False, 'mensaje': 'Ingresá un correo electrónico válido.'}, status=400)

    ok, mensaje = send_email(destinatario, ultimo_dato, es_alerta=False)
    status = 200 if ok else 500
    return JsonResponse({'ok': ok, 'mensaje': mensaje}, status=status)
