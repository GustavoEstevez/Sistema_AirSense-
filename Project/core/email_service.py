"""
Servicio de envío de correos para alertas y reportes manuales de AirSense.

Dos vías de envío:
  - Resend API (HTTPS): vía principal en producción. Es la única que
    funciona en Railway porque bloquea el tráfico SMTP saliente.
  - Gmail SMTP: respaldo para desarrollo local (runserver).

El cuerpo del correo replica el diseño visual del dashboard (HTML + texto plano).
"""

import json
import os  # para detectar si estamos corriendo en Railway
import smtplib
import urllib.error
import urllib.request
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.conf import settings

from .metrics import analyze_environment


# Endpoint de la API de Resend (HTTPS, no usa SMTP)
RESEND_API_URL = 'https://api.resend.com/emails'


def _is_railway():
    # si estas variables existen, estamos en Railway (ahí el SMTP no anda)
    return bool(os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('RAILWAY_PROJECT_ID'))


# Colores y estilos alineados con dashboard.css
METRIC_COLORS = {
    'Temperatura': '#f43f5e',
    'Humedad': '#0ea5e9',
    'Nivel de Ruido': '#7c3aed',
    'Calidad del Aire': '#10b981',
}

STATE_COLORS = {
    'normal':  {'bg': '#ecfdf5', 'text': '#047857', 'border': '#a7f3d0'},
    'warning': {'bg': '#fffbeb', 'text': '#92400e', 'border': '#fde68a'},
    'danger':  {'bg': '#fef2f2', 'text': '#b91c1c', 'border': '#fecaca'},
}

METRIC_ICONS = {
    'Temperatura': '🌡️',
    'Humedad': '💧',
    'Nivel de Ruido': '🔊',
    'Calidad del Aire': '🌿',
}

ENV_CARD_COLORS = {
    'healthy': {'bg': '#ecfdf5', 'border': '#a7f3d0', 'badge': '#10b981'},
    'warning': {'bg': '#fffbeb', 'border': '#fde68a', 'badge': '#f59e0b'},
    'danger':  {'bg': '#fef2f2', 'border': '#fecaca', 'badge': '#ef4444'},
}


def _format_metric_lines(metrics):
    """Arma las líneas de cada parámetro como aparecen en el dashboard (texto plano)."""
    lines = []
    for m in metrics:
        lines.append(
            f"  • {m['nombre']} ({m['sensor']}): "
            f"{m['valor']} {m['unidad']} — {m['estado']}"
        )
    return '\n'.join(lines)


def _build_metric_cards_html(metrics):
    """Genera tarjetas de métricas apiladas (una columna, legible en celular)."""
    cards = []
    for m in metrics:
        accent = METRIC_COLORS.get(m['nombre'], '#06b6d4')
        state = STATE_COLORS.get(m['nivel'], STATE_COLORS['normal'])
        icon = METRIC_ICONS.get(m['nombre'], m['nombre'][0])
        cards.append(f"""
        <tr>
          <td class="metric-card" style="padding:0 0 12px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#ffffff;border:1px solid #dde3ee;border-radius:14px;">
              <tr>
                <td style="padding:16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td width="48" style="width:48px;vertical-align:top;">
                        <div style="width:44px;height:44px;line-height:44px;border-radius:12px;
                                    background:{accent};color:#ffffff;text-align:center;
                                    font-size:22px;">
                          {icon}
                        </div>
                      </td>
                      <td style="padding-left:12px;vertical-align:top;">
                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;
                                    font-weight:700;color:#0a1633;line-height:1.3;">
                          {m['nombre']}
                        </div>
                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;
                                    color:#5c6886;margin-top:2px;">
                          {m['sensor']}
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div class="metric-value" style="font-family:Arial,Helvetica,sans-serif;
                       font-size:32px;font-weight:700;color:#0a1633;margin:14px 0 4px 0;
                       line-height:1.1;">
                    {m['valor']}
                    <span style="font-size:16px;font-weight:600;color:#5c6886;">
                      {m['unidad']}
                    </span>
                  </div>
                  <span style="display:inline-block;padding:6px 14px;border-radius:999px;
                               font-family:Arial,Helvetica,sans-serif;font-size:13px;
                               font-weight:600;background:{state['bg']};color:{state['text']};
                               border:1px solid {state['border']};">
                    {m['estado']}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        """)
    return ''.join(cards)


def build_email_html(datos, es_alerta=False):
    """Construye el cuerpo HTML del correo con apariencia del dashboard."""
    analysis = analyze_environment(datos)
    ahora = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    env_key = analysis['env_state']
    env_style = ENV_CARD_COLORS.get(env_key, ENV_CARD_COLORS['healthy'])

    if es_alerta:
        header_title = 'ALERTA — Ambiente No Saludable'
        header_sub = 'El dashboard detectó condiciones fuera de los rangos seguros. Tomá medidas de inmediato.'
        header_bg = '#fef2f2'
        header_border = '#ef4444'
    else:
        header_title = 'Reporte de lecturas actuales'
        header_sub = 'Lecturas en tiempo real de la estación AirSense.'
        header_bg = '#ecfdf5'
        header_border = '#10b981'

    metric_rows = _build_metric_cards_html(analysis['metrics'])

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>AirSense</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote {{
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }}
    table, td {{
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }}
    img {{
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }}
    @media only screen and (max-width: 520px) {{
      .email-wrap {{ padding: 12px 8px !important; }}
      .email-body {{ border-radius: 16px !important; }}
      .pad-header {{ padding: 20px 16px 14px 16px !important; }}
      .pad-banner {{ padding: 16px !important; }}
      .pad-section {{ padding: 16px !important; }}
      .pad-footer {{ padding: 14px 16px 18px 16px !important; }}
      .banner-title {{ font-size: 16px !important; }}
      .banner-sub {{ font-size: 13px !important; }}
      .metric-value {{ font-size: 28px !important; }}
      .logo-text {{ font-size: 22px !important; }}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background:#EBF4F6;font-family:Arial,Helvetica,sans-serif;
             color:#0f1729;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         class="email-wrap" style="background:#EBF4F6;padding:20px 10px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               class="email-body"
               style="max-width:480px;background:#ffffff;border:1px solid #dde3ee;
                      border-radius:18px;overflow:hidden;">
          <!-- Encabezado AirSense -->
          <tr>
            <td class="pad-header"
                style="padding:24px 20px 16px 20px;background:#0a1633;">
              <div class="logo-text"
                   style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;
                          line-height:1.2;">
                Air<span style="color:#67e8f9;">Sense</span>
              </div>
              <div style="font-size:13px;color:#9DC7CF;margin-top:4px;line-height:1.4;">
                Monitoreo ambiental inteligente
              </div>
            </td>
          </tr>

          <!-- Banner de alerta o reporte -->
          <tr>
            <td class="pad-banner"
                style="padding:18px 20px;background:{header_bg};border-bottom:3px solid {header_border};">
              <div class="banner-title"
                   style="font-size:17px;font-weight:700;color:#0a1633;line-height:1.35;">
                {header_title}
              </div>
              <div class="banner-sub"
                   style="font-size:14px;color:#5c6886;margin-top:6px;line-height:1.55;">
                {header_sub}
              </div>
            </td>
          </tr>

          <!-- Estado general -->
          <tr>
            <td class="pad-section" style="padding:18px 20px 8px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:{env_style['bg']};border:1px solid {env_style['border']};
                            border-radius:14px;">
                <tr>
                  <td style="padding:16px;">
                    <div style="font-size:16px;font-weight:700;color:#0a1633;line-height:1.35;">
                      {analysis['env_title']}
                    </div>
                    <div style="font-size:13px;color:#5c6886;margin-top:6px;line-height:1.4;">
                      Fecha y hora: {ahora}
                    </div>
                    <span style="display:inline-block;margin-top:12px;padding:7px 14px;
                                 border-radius:999px;font-size:13px;font-weight:700;
                                 color:#ffffff;background:{env_style['badge']};">
                      {analysis['env_badge']}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Métricas apiladas (una por fila) -->
          <tr>
            <td class="pad-section" style="padding:8px 20px 16px 20px;">
              <div style="font-size:14px;font-weight:700;color:#0a1633;padding:0 0 12px 0;">
                Parámetros monitoreados
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                {metric_rows}
              </table>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td class="pad-footer"
                style="padding:16px 20px 20px 20px;border-top:1px solid #dde3ee;background:#f5f7fb;">
              <div style="font-size:12px;color:#5c6886;line-height:1.65;">
                Este mensaje fue generado automáticamente por AirSense.<br>
                Rangos de referencia: OMS / ASHRAE.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def build_email_body(datos, es_alerta=False):
    """
    Construye cuerpo plano y HTML del correo con los parámetros actuales.

    es_alerta=True  → encabezado de alerta (ambiente no saludable)
    es_alerta=False → reporte informativo bajo demanda
    """
    analysis = analyze_environment(datos)
    ahora = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    if es_alerta:
        titulo = 'ALERTA AirSense — Ambiente No Saludable'
        intro = (
            'El dashboard detectó condiciones fuera de los rangos seguros.\n'
            'Tomá medidas de inmediato para mejorar el ambiente.'
        )
    else:
        titulo = 'AirSense — Reporte de lecturas actuales'
        intro = 'Te enviamos las lecturas en tiempo real de la estación AirSense.'

    metricas = _format_metric_lines(analysis['metrics'])

    cuerpo_plano = f"""{titulo}
{'=' * 52}

{intro}

Estado general: {analysis['env_title']} ({analysis['env_badge']})
Fecha y hora:   {ahora}

Parámetros monitoreados
-----------------------
{metricas}

---
AirSense — Monitoreo ambiental inteligente
Este mensaje fue generado automáticamente por el sistema.
"""
    cuerpo_html = build_email_html(datos, es_alerta=es_alerta)
    return cuerpo_plano, cuerpo_html, analysis


def _send_via_resend(destinatario, asunto, cuerpo_plano, cuerpo_html):
    """
    Envía el correo usando la API de Resend por HTTPS.

    Funciona en Railway (bloquea SMTP). Requiere RESEND_API_KEY en settings/env.
    """
    api_key = (getattr(settings, 'RESEND_API_KEY', '') or '').strip()
    if not api_key:
        return False, 'Falta RESEND_API_KEY en la configuración del servidor.'

    remitente = (getattr(settings, 'AIRSENSE_RESEND_FROM', '') or '').strip() \
        or 'AirSense <onboarding@resend.dev>'

    payload = {
        'from': remitente,
        'to': [destinatario],
        'subject': asunto,
        'html': cuerpo_html,
        'text': cuerpo_plano,
        'reply_to': settings.EMAIL_HOST_USER,  # si te responden, va a tu Gmail
    }
    req = urllib.request.Request(
        RESEND_API_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            # Resend está detrás de Cloudflare: sin un User-Agent explícito
            # la petición de urllib se bloquea con 403 error code 1010.
            'User-Agent': 'AirSense/1.0 (Django; +https://airsense.local)',
        },
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp.read()
        return True, f'Correo enviado correctamente a {destinatario}.'
    except urllib.error.HTTPError as exc:
        detalle = exc.read().decode('utf-8', errors='replace')
        return False, f'Error al enviar el correo: {exc.code} {detalle}'
    except urllib.error.URLError as exc:
        return False, f'Error de conexión al enviar el correo: {exc.reason}'


def send_email(destinatario, datos, es_alerta=False):
    """
    Envía un correo con las lecturas actuales al destinatario indicado.

    Usa Resend (HTTPS) si hay RESEND_API_KEY configurada; si no, Gmail SMTP.

    Retorna (ok: bool, mensaje: str).
    """
    if not datos:
        return False, 'No hay datos de sensores disponibles todavía.'

    cuerpo_plano, cuerpo_html, analysis = build_email_body(datos, es_alerta=es_alerta)

    if es_alerta:
        asunto = f'ALERTA AirSense — {analysis["env_badge"]}'
    else:
        asunto = f'AirSense — Lecturas actuales ({analysis["env_badge"]})'

    # si hay API key de Resend, manda por HTTPS (sirve en Railway)
    api_key = (getattr(settings, 'RESEND_API_KEY', '') or '').strip()
    if api_key:
        return _send_via_resend(destinatario, asunto, cuerpo_plano, cuerpo_html)

    # en Railway no intentamos SMTP porque los puertos están bloqueados
    if _is_railway():
        return False, (
            'Railway bloquea el SMTP saliente. Configurá la variable de entorno '
            'RESEND_API_KEY en el panel de Railway (https://resend.com/api-keys).'
        )

    remitente = settings.EMAIL_HOST_USER
    password = settings.EMAIL_HOST_PASSWORD

    # Mensaje multipart: HTML con estilos del dashboard + texto plano de respaldo
    mensaje = MIMEMultipart('alternative')
    mensaje['From'] = remitente
    mensaje['To'] = destinatario
    mensaje['Subject'] = asunto
    mensaje.attach(MIMEText(cuerpo_plano, 'plain', 'utf-8'))
    mensaje.attach(MIMEText(cuerpo_html, 'html', 'utf-8'))

    try:
        # Conexión segura a Gmail (puerto 587 + STARTTLS)
        # timeout corto: si el servidor de correo no responde, falla rápido
        # en vez de colgar el worker de gunicorn.
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=20) as servidor:
            servidor.ehlo()
            servidor.starttls()
            servidor.ehlo()
            servidor.login(remitente, password)
            servidor.sendmail(remitente, [destinatario], mensaje.as_string())
        return True, f'Correo enviado correctamente a {destinatario}.'
    except smtplib.SMTPException as exc:
        return False, f'Error SMTP al enviar el correo: {exc}'
    except OSError as exc:
        return False, f'Error de conexión con el servidor de correo: {exc}'
