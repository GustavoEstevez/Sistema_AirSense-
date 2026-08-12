from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):
        # Arranca el monitor que reenvía alertas cada 3 min si el estado no cambia
        from .alert_monitor import start_alert_monitor
        start_alert_monitor()
