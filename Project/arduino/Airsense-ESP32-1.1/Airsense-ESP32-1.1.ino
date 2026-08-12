#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h>
#include <Preferences.h>
#include "SH1106Wire.h"
#include "Adafruit_SHT31.h"
#include "MQUnifiedsensor.h"

// ---- CONFIGURACIÓN DJANGO ----
// URL por defecto del servidor (Railway). Se puede cambiar desde el portal de
// WiFiManager (192.168.4.1) y queda guardada para los próximos encendidos.
// Ej para demo sin internet (red local): http://192.168.1.4:8000/dashboard/sensor/datos/
const char* DEFAULT_SERVER_URL = "https://airsense.up.railway.app/dashboard/sensor/datos/";
String serverUrl = DEFAULT_SERVER_URL;
WiFiManagerParameter custom_server(
    "server",
    "URL del servidor (si no hay internet usar IP local: http://IP-DE-LA-PC:8000/dashboard/sensor/datos/)",
    DEFAULT_SERVER_URL,
    120);

Preferences prefs;

// ---- PINES ----
#define MIC_PIN   34
#define MQ135_PIN 35
#define LED_PIN   2
#define BUTTON_PIN 4

// ---- INSTANCIAS ----
SH1106Wire display(0x3C, 21, 22);
Adafruit_SHT31 sht31;
MQUnifiedsensor mq135("ESP32", 3.3, 12, MQ135_PIN, "MQ-135");
WiFiManager wm;   // <-- ahora global, para poder resetearlo desde el comando serial

// ---- VARIABLES COMPARTIDAS ----
SemaphoreHandle_t datosMutex;
float g_temperatura = 0;
float g_humedad     = 0;
int   g_ruido        = 0;
float g_co2          = 0;

volatile int g_estadoRed = 0; // 0=configurando 1=WiFi ok sin server 2=todo ok

// ---- SEGUIMIENTO CONTINUO DE NIVEL ----
float biasDC     = 1900;
float nivelRuido = 0;

// ---- CALIBRACIÓN ----
const float NIVEL_SILENCIO = 40;
const float NIVEL_FUERTE   = 170;
const float DB_SILENCIO    = 35;
const float DB_FUERTE      = 90;

const int MAX_MUESTRAS_POST = 60;
int muestrasParaPost[MAX_MUESTRAS_POST];
int cantMuestrasPost = 0;

const uint8_t PROGMEM epd_bitmap_logo[] = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xA8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xA1, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x7C, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x8A, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x0D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05, 0x50, 0x01, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x20, 0x00, 0xB0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0xA0, 0x28, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x90, 0x09, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x40, 0x00, 0x20, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x01, 0xFF, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x80, 0x60, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x3A, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0xA0, 0x7F, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x43, 0xF7, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x00, 0x0A, 0x0E, 0x80, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x34, 0x3A, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x0A, 0x02, 0xD0, 0xE8, 0x7F, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x21, 0x5A, 0x83, 0xA3, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xA4, 0x0D, 0x0A, 0x1F, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x00, 0x54, 0x34, 0xF7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x03, 0x4A, 0xF1, 0x42, 0xBC, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB5, 0x02, 0xDF, 0xD0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};

unsigned long lastDisplay = 0;
unsigned long lastSensoresLentos = 0;
const unsigned long INTERVALO_DISPLAY = 200;
const unsigned long INTERVALO_SENSORES_LENTOS = 2000;

// =============================================================
// AMBIENT SCORE
// =============================================================
int puntajeTemp(float t) {
  if (t <= 0) return 3;
  float dist = abs(t - 22.0);
  if (dist <= 2) return 5;
  if (dist <= 4) return 4;
  if (dist <= 6) return 3;
  if (dist <= 9) return 2;
  return 1;
}

int puntajeHumedad(float h) {
  if (h <= 0) return 3;
  float dist = abs(h - 50.0);
  if (dist <= 5)  return 5;
  if (dist <= 10) return 4;
  if (dist <= 15) return 3;
  if (dist <= 20) return 2;
  return 1;
}

int puntajeRuido(int db) {
  if (db <= 40) return 5;
  if (db <= 50) return 4;
  if (db <= 65) return 3;
  if (db <= 75) return 2;
  return 1;
}

int puntajeCO2(float ppm) {
  if (ppm <= 800)  return 5;
  if (ppm <= 1000) return 4;
  if (ppm <= 1500) return 3;
  if (ppm <= 2000) return 2;
  return 1;
}

int calcularAmbientScore(float t, float h, int db, float ppm) {
  float prom = (puntajeTemp(t) + puntajeHumedad(h) + puntajeRuido(db) + puntajeCO2(ppm)) / 4.0;
  int score = (int)round(prom);
  return constrain(score, 0, 5);
}

void dibujarBitmap(const uint8_t *bitmap, int x0, int y0, int w, int h) {
  int bytesPorFila = (w + 7) / 8;
  for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) {
      int indiceByte = y * bytesPorFila + (x / 8);
      uint8_t b = pgm_read_byte(&bitmap[indiceByte]);
      bool encendido = b & (0x80 >> (x % 8));  // MSB primero, igual que exportó la herramienta
      if (encendido) {
        display.setPixel(x0 + x, y0 + y);
      }
    }
  }
  
}

void animacionInicio() {
  display.clear();
  dibujarBitmap(epd_bitmap_logo, 0, 0, 128, 64);
  display.display();
  delay(2000);

  display.setFont(ArialMT_Plain_16);
  display.setTextAlignment(TEXT_ALIGN_CENTER);

  String texto = "AirSense";
  String parcial = "";
  for (int i = 0; i < texto.length(); i++) {
    parcial += texto[i];
    display.clear();
    display.drawString(64, 20, parcial);
    display.display();
    delay(70);
  }
  delay(400);

  display.setFont(ArialMT_Plain_10);
  for (int p = 0; p <= 100; p += 4) {
    display.clear();
    display.drawString(64, 10, "AirSense");
    display.drawString(64, 25, "Iniciando sensores...");
    display.drawProgressBar(14, 42, 100, 10, p);
    display.display();
    delay(30);
  }
  delay(300);
  display.setTextAlignment(TEXT_ALIGN_LEFT);
}

void dibujarEstrella(int x, int y, bool llena) {
  display.setPixel(x + 2, y + 0);
  if (llena) {
    display.setPixel(x + 1, y + 1); display.setPixel(x + 2, y + 1); display.setPixel(x + 3, y + 1);
    display.setPixel(x + 0, y + 2); display.setPixel(x + 1, y + 2); display.setPixel(x + 2, y + 2);
    display.setPixel(x + 3, y + 2); display.setPixel(x + 4, y + 2);
    display.setPixel(x + 1, y + 3); display.setPixel(x + 2, y + 3); display.setPixel(x + 3, y + 3);
  } else {
    display.setPixel(x + 1, y + 1); display.setPixel(x + 3, y + 1);
    display.setPixel(x + 0, y + 2); display.setPixel(x + 4, y + 2);
    display.setPixel(x + 1, y + 3); display.setPixel(x + 3, y + 3);
  }
  display.setPixel(x + 2, y + 4);
  display.setFont(ArialMT_Plain_10);


}

void dibujarScore(int score) {
  for (int i = 0; i < 5; i++) {
    dibujarEstrella(86 + i * 8, 12, i < score);
  }
}

void iconoTermometro(int x, int y) {
  display.drawVerticalLine(x + 3, y, 7);
  display.fillCircle(x + 3, y + 9, 3);
}

void iconoGota(int x, int y) {
  display.drawCircle(x + 3, y + 5, 3);
  display.drawLine(x + 3, y, x, y + 4);
  display.drawLine(x + 3, y, x + 6, y + 4);
}

void iconoOndas(int x, int y) {
  display.fillRect(x, y + 5, 2, 4);
  display.fillRect(x + 4, y + 2, 2, 7);
  display.fillRect(x + 8, y + 4, 2, 5);
}

void iconoMolecula(int x, int y) {
  display.fillCircle(x + 1, y + 1, 1);
  display.fillCircle(x + 6, y + 1, 1);
  display.fillCircle(x + 3, y + 6, 1);
  display.drawLine(x + 1, y + 1, x + 6, y + 1);
  display.drawLine(x + 1, y + 1, x + 3, y + 6);
}

void iconoBateria(int x, int y, int pct) {
  display.drawRect(x, y, 16, 8);
  display.fillRect(x + 16, y + 2, 2, 4);
  int ancho = map(pct, 0, 100, 0, 12);
  display.fillRect(x + 2, y + 2, ancho, 4);
}

void mostrarDatosAesthetic(float t, float h, int db, float co2, int score, int bateriaPct) {
  display.clear();

  display.setFont(ArialMT_Plain_10);
  display.setTextAlignment(TEXT_ALIGN_LEFT);
  display.drawString(0, 0, "EcoStation");
  iconoBateria(104, 1, bateriaPct);

  display.drawHorizontalLine(0, 11, 128);
  display.drawVerticalLine(64, 11, 42);
  display.drawHorizontalLine(0, 32, 128);

  iconoTermometro(4, 15);
  display.drawString(18, 16, String(t, 1) + "C");

  iconoGota(72, 15);
  display.drawString(86, 16, String(h, 0) + "%");

  iconoOndas(4, 37);
  display.drawString(18, 37, String(db) + "dB");

  iconoMolecula(72, 37);
  display.drawString(86, 37, String(co2, 0));

  display.drawHorizontalLine(0, 53, 128);
  display.setTextAlignment(TEXT_ALIGN_CENTER);
  display.drawString(64, 54, "AirScore");
  for (int i = 0; i < 5; i++) {
    dibujarEstrella(44 + i * 8, 54, i < score);
  }
  display.setTextAlignment(TEXT_ALIGN_LEFT);

  display.display();
}
// =============================================================
// CALLBACK del portal de configuración
// =============================================================
void alEntrarModoConfig(WiFiManager *wmPtr) {
  Serial.println("Portal de configuración abierto");
  Serial.println("Conectate desde el celu a la red: ESP32-EstacionAmbiental");
  g_estadoRed = 0;

  display.clear();
  display.setFont(ArialMT_Plain_10);
  display.drawString(0, 0,  "Configurar WiFi:");
  display.drawString(0, 14, "Red: ESP32-EstacionAmbiental");
  display.drawString(0, 28, "Clave: 12345678");
  display.drawString(0, 42, "Ir a 192.168.4.1");
  display.display();
}

// =============================================================
// GUARDAR CONFIGURACIÓN (WiFiManager + URL del servidor)
// =============================================================
void guardarConfigCallback() {
  // Se llama únicamente cuando el usuario guarda desde el portal WiFiManager.
  // Solo acá se actualiza serverUrl, para no pisar la URL guardada en cada boot.
  serverUrl = String(custom_server.getValue());
  prefs.begin("airsense", false);
  prefs.putString("server", serverUrl);
  prefs.end();
  Serial.print("Guardando URL del servidor: ");
  Serial.println(serverUrl);
}

// =============================================================
// TAREA DE LED (núcleo 0)
// =============================================================
void tareaLed(void *parametro) {
  pinMode(LED_PIN, OUTPUT);
  for (;;) {
    switch (g_estadoRed) {
      case 0:
        digitalWrite(LED_PIN, HIGH); vTaskDelay(120 / portTICK_PERIOD_MS);
        digitalWrite(LED_PIN, LOW);  vTaskDelay(120 / portTICK_PERIOD_MS);
        break;
      case 1:
        digitalWrite(LED_PIN, HIGH); vTaskDelay(800 / portTICK_PERIOD_MS);
        digitalWrite(LED_PIN, LOW);  vTaskDelay(800 / portTICK_PERIOD_MS);
        break;
      default:
        digitalWrite(LED_PIN, HIGH); vTaskDelay(500 / portTICK_PERIOD_MS);
        break;
    }
  }
}

// =============================================================
// TAREA DE BOTÓN DE RESET (núcleo 0): independiente del estado de red
// =============================================================
bool g_temaInvertido = false;

void tareaBoton(void *parametro) {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  unsigned long tiempoPresionado = 0;
  bool contando = false;
  bool yaResetTriggereado = false;

  for (;;) {
    bool presionado = (digitalRead(BUTTON_PIN) == LOW);

    if (presionado && !contando) {
      contando = true;
      yaResetTriggereado = false;
      tiempoPresionado = millis();
    }

    if (presionado && contando && !yaResetTriggereado && (millis() - tiempoPresionado >= 3000)) {
      yaResetTriggereado = true;
      Serial.println("Boton mantenido 3s: borrando credenciales WiFi...");
      pinMode(LED_PIN, OUTPUT);
      for (int i = 0; i < 8; i++) {
        digitalWrite(LED_PIN, HIGH); delay(60);
        digitalWrite(LED_PIN, LOW);  delay(60);
      }
      WiFiManager wmReset;
      wmReset.resetSettings();
      delay(300);
      ESP.restart();
    }

    if (!presionado && contando) {
      unsigned long duracion = millis() - tiempoPresionado;
      if (duracion < 800 && !yaResetTriggereado) {
        g_temaInvertido = !g_temaInvertido;
        if (g_temaInvertido) {
          display.invertDisplay();
        } else {
          display.normalDisplay();
}
      }
      contando = false;
    }

    vTaskDelay(50 / portTICK_PERIOD_MS);
  }
}

// =============================================================
// TAREA DE RED (núcleo 0)
// =============================================================
void tareaRed(void *parametro) {
  wm.setAPCallback(alEntrarModoConfig);
  wm.setConnectTimeout(30);
  wm.setConfigPortalTimeout(180);
  wm.addParameter(&custom_server);
  // Prefill del campo con la URL guardada (la que se cargó en setup()).
  custom_server.setValue(serverUrl.c_str());
  wm.setSaveConfigCallback(guardarConfigCallback);

  bool conectado = wm.autoConnect("ESP32-EstacionAmbiental", "12345678");

  if (!conectado) {
    Serial.println("No se configuró a tiempo, reiniciando...");
    ESP.restart();
  }

  // La URL se mantiene: o la guardada en NVS (cargada en setup) o la que se
  // grabó recién desde el portal (guardarConfigCallback). No se pisa aquí.

  Serial.println("\nWiFi conectado");
  Serial.println(WiFi.localIP());
  Serial.print("Server URL: ");
  Serial.println(serverUrl);
  g_estadoRed = 2;

  WiFi.setSleep(false);

  display.clear();
  display.setFont(ArialMT_Plain_10);
  display.drawString(0, 0, "WiFi OK");
  display.drawString(0, 14, WiFi.localIP().toString());
  display.display();
  delay(1000);

  for (;;) {
    vTaskDelay(2000 / portTICK_PERIOD_MS);

    // --- comando por Serial para probar el reseteo del WiFi ---
    if (Serial.available()) {
      String cmd = Serial.readStringUntil('\n');
      cmd.trim();
      if (cmd == "reset") {
        Serial.println("Borrando credenciales WiFi guardadas...");
        wm.resetSettings();
        delay(500);
        ESP.restart();
      }
    }

    if (WiFi.status() != WL_CONNECTED) { g_estadoRed = 0; continue; }

    float temp, hum, co2val;
    int ruidoProm;
    xSemaphoreTake(datosMutex, portMAX_DELAY);
    temp = g_temperatura; hum = g_humedad; co2val = g_co2; ruidoProm = g_ruido;
    xSemaphoreGive(datosMutex);

    HTTPClient http;
    http.setConnectTimeout(1500);
    http.setTimeout(1500);
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String body = "{";
    body += "\"temperatura\":" + String(temp, 1) + ",";
    body += "\"humedad\":"     + String(hum, 1)  + ",";
    body += "\"ruido\":"       + String(ruidoProm) + ",";
    body += "\"co2\":"         + String(co2val, 0);
    body += "}";

    int code = http.POST(body);
    Serial.println("HTTP POST: " + String(code));
    http.end();

    g_estadoRed = (code > 0) ? 2 : 1;
  }
}

void setup() {
  Serial.begin(115200);
  analogSetAttenuation(ADC_11db);
  datosMutex = xSemaphoreCreateMutex();

  // Cargar la URL guardada (la que se configuró por WiFiManager).
  prefs.begin("airsense", false);
  String savedUrl = prefs.getString("server", "");
  prefs.end();
  if (savedUrl.length() > 0) {
    serverUrl = savedUrl;
  }

  display.init();
  display.flipScreenVertically();
  animacionInicio();
  display.clear();
  display.setFont(ArialMT_Plain_10);
  display.drawString(0, 0, "Iniciando...");
  display.display();

  if (!sht31.begin(0x44)) Serial.println("SHT30 no encontrado");

  mq135.setRegressionMethod(1);
  mq135.setA(110.47); mq135.setB(-2.862);
  mq135.init();
  mq135.setRL(10);
  mq135.setR0(10);

  long sumaInicial = 0;
  for (int i = 0; i < 200; i++) { sumaInicial += analogRead(MIC_PIN); delayMicroseconds(500); }
  biasDC = sumaInicial / 200.0;
  Serial.printf("Bias DC inicial: %.1f\n", biasDC);

  xTaskCreatePinnedToCore(tareaLed, "TareaLed", 2048, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(tareaRed, "TareaRed", 8192, NULL, 1, NULL, 0);
  xTaskCreatePinnedToCore(tareaBoton, "TareaBoton", 2048, NULL, 1, NULL, 0);

  display.clear();
  display.drawString(0, 0, "WiFi conectando...");
  display.display();
  delay(500);
}

int leerMicMediana() {
  const int N = 15;
  int muestras[N];
  for (int i = 0; i < N; i++) muestras[i] = analogRead(MIC_PIN);
  for (int i = 0; i < N - 1; i++) {
    for (int j = i + 1; j < N - i - 1; j++) {
      if (muestras[j] > muestras[j + 1]) {
        int tmp = muestras[j]; muestras[j] = muestras[j + 1]; muestras[j + 1] = tmp;
      }
    }
  }
  return muestras[N / 2];
}

void loop() {
  unsigned long now = millis();

  int muestra = leerMicMediana();
  if (muestra > 0 && muestra < 4095) {
    biasDC += (muestra - biasDC) * 0.0005;
    float desviacion = abs(muestra - biasDC);
    float maxSalto = 40.0;
    if (desviacion - nivelRuido > maxSalto) desviacion = nivelRuido + maxSalto;
    if (desviacion > nivelRuido) nivelRuido += (desviacion - nivelRuido) * 0.3;
    else nivelRuido += (desviacion - nivelRuido) * 0.02;
  }

  if (now - lastDisplay >= INTERVALO_DISPLAY) {
    int ruidoInstant = DB_SILENCIO + (nivelRuido - NIVEL_SILENCIO) *
                        (DB_FUERTE - DB_SILENCIO) / (NIVEL_FUERTE - NIVEL_SILENCIO);
    ruidoInstant = constrain(ruidoInstant, 25, 100);
    if (cantMuestrasPost < MAX_MUESTRAS_POST) muestrasParaPost[cantMuestrasPost++] = ruidoInstant;
    lastDisplay = now;
  }

  if (now - lastSensoresLentos >= INTERVALO_SENSORES_LENTOS) {
    float t = sht31.readTemperature();
    float h = sht31.readHumidity();
    if (isnan(t)) t = 0;
    if (isnan(h)) h = 0;

    mq135.update();
    float c = constrain(mq135.readSensor(), 0, 5000);

    long suma = 0;
    for (int i = 0; i < cantMuestrasPost; i++) suma += muestrasParaPost[i];
    int promedioFinal = cantMuestrasPost > 0 ? suma / cantMuestrasPost : 0;

    xSemaphoreTake(datosMutex, portMAX_DELAY);
    g_temperatura = t; g_humedad = h; g_co2 = c; g_ruido = promedioFinal;
    xSemaphoreGive(datosMutex);

    int score = calcularAmbientScore(t, h, promedioFinal, c);

    display.clear();
    display.setFont(ArialMT_Plain_10);
    display.drawString(0, 0,  "Temp:  " + String(t, 1) + " C");
    display.drawString(0, 14, "Hum:   " + String(h, 1) + " %");
    display.drawString(0, 28, "Ruido: " + String(promedioFinal) + " dB");
    display.drawString(0, 42, "CO2:   " + String(c, 0) + " ppm");
    display.drawString(88, 0, "AirScore");
    dibujarScore(score);
    display.display();

    Serial.printf(">>> Promedio dB:%d  AmbientScore:%d/5\n", promedioFinal, score);

    cantMuestrasPost = 0;
    lastSensoresLentos = now;
  }
}
