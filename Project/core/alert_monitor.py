"""
Monitor de alertas por correo en segundo plano.

- Envía alerta cuando el ambiente pasa a «No Saludable».
- Si el estado sigue sin cambiar, reenvía la alerta cada 3 minutos.
- Deja de enviar cuando el ambiente vuelve a ser saludable o advertencia.
"""

import logging
import threading
import time

from django.conf import settings

from .email_service import send_email
from .metrics import is_unhealthy

logger = logging.getLogger(__name__)

# Intervalo entre reenvíos mientras sigue «No Saludable» (3 minutos)
ALERT_INTERVAL_SECONDS = 180
# Frecuencia con la que el hilo en segundo plano revisa el estado
MONITOR_CHECK_SECONDS = 30

# Estado interno del monitor (protegido con lock para hilos concurrentes)
_lock = threading.Lock()
_last_env_state = None
_last_sent_at = 0.0
_monitor_started = False


def _get_datos():
    """Importación tardía para evitar import circular con views."""
    from . import views
    return views.ultimo_dato


def _get_default_recipient():
    """Destinatario por defecto de las alertas automáticas."""
    return getattr(settings, 'AIRSENSE_ALERT_EMAIL', settings.EMAIL_HOST_USER)


def _evaluate_and_send():
    """
    Evalúa el estado y envía correo si corresponde.

    Retorna (enviado: bool, mensaje: str | None).
    Debe llamarse con _lock ya adquirido.

    Envía solo cuando:
      1. El ambiente acaba de pasar a «No Saludable», o
      2. Sigue en «No Saludable» y pasaron 3 minutos desde el último envío.

    Ignora cambios en recomendaciones mientras el estado siga siendo danger.
    """
    global _last_env_state, _last_sent_at

    datos = _get_datos()
    if not datos:
        return False, None

    unhealthy = is_unhealthy(datos)
    now = time.time()

    if not unhealthy:
        _last_env_state = 'healthy_or_warning'
        return False, None

    state_just_became_bad = _last_env_state != 'danger'
    interval_elapsed = _last_sent_at == 0 or (now - _last_sent_at) >= ALERT_INTERVAL_SECONDS
    should_send = state_just_became_bad or interval_elapsed

    if not should_send:
        return False, None

    destinatario = _get_default_recipient()
    ok, msg = send_email(destinatario, datos, es_alerta=True)
    if ok:
        _last_sent_at = now
        _last_env_state = 'danger'
        logger.info('[AirSense] Alerta enviada a %s', destinatario)
    else:
        logger.warning('[AirSense] No se pudo enviar alerta: %s', msg)
    return ok, msg


def process_alert_on_entry():
    """
    Evalúa alerta al ingresar al dashboard.

    Usa la misma lógica de intervalo que el monitor para evitar correos duplicados.
    """
    datos = _get_datos()
    if not datos or not is_unhealthy(datos):
        return False, 'No se requiere alerta (ambiente saludable o sin datos).'

    with _lock:
        enviado, msg = _evaluate_and_send()

    if enviado:
        return True, msg
    return True, 'Alerta ya enviada recientemente; se reenviará si persiste el estado.'


def process_alert_cycle():
    """
    Evalúa el estado actual y envía correo si corresponde.

    Llamado por el ESP32 y el hilo en segundo plano.
    """
    with _lock:
        _evaluate_and_send()


def _monitor_loop():
    """Bucle del hilo daemon: revisa periódicamente si hay que reenviar."""
    while True:
        try:
            process_alert_cycle()
        except Exception:
            logger.exception('[AirSense] Error en el monitor de alertas')
        time.sleep(MONITOR_CHECK_SECONDS)


def start_alert_monitor():
    """Arranca el hilo de monitoreo una sola vez al iniciar Django."""
    global _monitor_started
    if _monitor_started:
        return
    _monitor_started = True

    hilo = threading.Thread(target=_monitor_loop, name='AirSenseAlertMonitor', daemon=True)
    hilo.start()
    logger.info(
        '[AirSense] Monitor de alertas iniciado (revisión cada %ss, reenvío cada %ss)',
        MONITOR_CHECK_SECONDS,
        ALERT_INTERVAL_SECONDS,
    )
