"""
Lógica de clasificación de métricas del dashboard AirSense.

Replica los mismos rangos y etiquetas que usa el JavaScript del dashboard
para que el servidor calcule el mismo estado que ve el usuario en pantalla.
"""

# Rangos OMS/ASHRAE (idénticos a script.js)
RANGES = {
    'temp':  {'ok_min': 18, 'ok_max': 26, 'warn_min': 15, 'warn_max': 30},
    'hum':   {'ok_min': 40, 'ok_max': 60, 'warn_min': 30, 'warn_max': 70},
    'noise': {'ok_max': 50, 'warn_max': 70},
    'co2':   {'ok_max': 800, 'warn_max': 1200},
}


def _to_float(value):
    """Convierte un valor a float o devuelve None si no es numérico."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def classify_temp(t):
    """Clasifica la temperatura y devuelve estado + etiqueta legible."""
    t = _to_float(t)
    if t is None:
        return 'normal', '—'
    r = RANGES['temp']
    if t < r['warn_min'] or t > r['warn_max']:
        label = 'Muy Caliente' if t > r['warn_max'] else 'Muy Frío'
        return 'danger', label
    if t < r['ok_min'] or t > r['ok_max']:
        label = 'Cálido' if t > r['ok_max'] else 'Fresco'
        return 'warning', label
    return 'normal', 'Normal'


def classify_hum(h):
    """Clasifica la humedad relativa."""
    h = _to_float(h)
    if h is None:
        return 'normal', '—'
    r = RANGES['hum']
    if h < r['warn_min'] or h > r['warn_max']:
        label = 'Muy Húmedo' if h > r['warn_max'] else 'Muy Seco'
        return 'danger', label
    if h < r['ok_min'] or h > r['ok_max']:
        label = 'Húmedo' if h > r['ok_max'] else 'Seco'
        return 'warning', label
    return 'normal', 'Óptima'


def classify_noise(n):
    """Clasifica el nivel de ruido en decibeles."""
    n = _to_float(n)
    if n is None:
        return 'normal', '—'
    r = RANGES['noise']
    if n > r['warn_max']:
        return 'danger', 'Muy Ruidoso'
    if n > r['ok_max']:
        return 'warning', 'Elevado'
    return 'normal', 'Ruido Bajo'


def classify_co2(c):
    """Clasifica la calidad del aire según ppm de CO₂."""
    c = _to_float(c)
    if c is None:
        return 'normal', '—'
    r = RANGES['co2']
    if c > r['warn_max']:
        return 'danger', 'Aire Viciado'
    if c > r['ok_max']:
        return 'warning', 'Ventilación Necesaria'
    return 'normal', 'Aire Fresco'


def analyze_environment(datos):
    """
    Analiza un dict de lecturas y devuelve el estado global del ambiente.

    Retorna un dict con:
      - env_state: 'healthy' | 'warning' | 'danger'
      - env_title: título mostrado en la tarjeta de estado
      - env_badge: texto del badge (Saludable / Advertencia / No Saludable)
      - metrics: lista de parámetros con valor, unidad y estado
    """
    t_state, t_label = classify_temp(datos.get('temperatura'))
    h_state, h_label = classify_hum(datos.get('humedad'))
    n_state, n_label = classify_noise(datos.get('ruido'))
    c_state, c_label = classify_co2(datos.get('co2'))

    states = [t_state, h_state, n_state, c_state]
    if 'danger' in states:
        env_state = 'danger'
        env_title = 'Ambiente No Saludable'
        env_badge = 'No Saludable'
    elif 'warning' in states:
        env_state = 'warning'
        env_title = 'Advertencia Ambiental'
        env_badge = 'Advertencia'
    else:
        env_state = 'healthy'
        env_title = 'Ambiente Saludable'
        env_badge = 'Saludable'

    def fmt(value):
        num = _to_float(value)
        return '--' if num is None else f'{num:.1f}'

    metrics = [
        {
            'nombre': 'Temperatura',
            'sensor': 'Sensor SHT30',
            'valor': fmt(datos.get('temperatura')),
            'unidad': '°C',
            'estado': t_label,
            'nivel': t_state,
        },
        {
            'nombre': 'Humedad',
            'sensor': 'Sensor SHT30',
            'valor': fmt(datos.get('humedad')),
            'unidad': '%',
            'estado': h_label,
            'nivel': h_state,
        },
        {
            'nombre': 'Nivel de Ruido',
            'sensor': 'Micrófono MAX4466',
            'valor': fmt(datos.get('ruido')),
            'unidad': 'dB',
            'estado': n_label,
            'nivel': n_state,
        },
        {
            'nombre': 'Calidad del Aire',
            'sensor': 'Sensor MQ135',
            'valor': fmt(datos.get('co2')),
            'unidad': 'ppm',
            'estado': c_label,
            'nivel': c_state,
        },
    ]

    return {
        'env_state': env_state,
        'env_title': env_title,
        'env_badge': env_badge,
        'metrics': metrics,
    }


def is_unhealthy(datos):
    """True cuando el dashboard mostraría «Ambiente No Saludable»."""
    return analyze_environment(datos)['env_state'] == 'danger'
