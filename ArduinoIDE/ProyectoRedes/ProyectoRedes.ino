#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebSocketsServer.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <math.h>

const char* ssid = "TIGO-A9C7";
const char* password = "tigo2019";

WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_MPU6050 mpu;

const int PIN_MOTOR = 18;
const int UMBRAL_ANGULO = 25;

float inclinacion = 0;

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

  if(type == WStype_CONNECTED) {
    Serial.println("Client connected");
  }

  if(type == WStype_DISCONNECTED) {
    Serial.println("Client disconnected");
  }
}

void setup() {

  Serial.begin(115200);
  pinMode(PIN_MOTOR, OUTPUT);

  Wire.begin();
  Wire.setClock(10000);

  if (!mpu.begin()) {
    Serial.println("MPU6050 error");
    while (1) delay(10);
  }

  WiFi.begin(ssid, password);

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Start mDNS AFTER WiFi
  if (!MDNS.begin("posturefix")) {
    Serial.println("Error starting mDNS");
  } else {
    Serial.println("mDNS started: posturefix.local");
  }
  Serial.println("WebSocket server started on port 81");
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {

  webSocket.loop();

  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  inclinacion = atan2(a.acceleration.y, a.acceleration.z) * 180 / M_PI;

  if (abs(inclinacion) > UMBRAL_ANGULO) {
    digitalWrite(PIN_MOTOR, HIGH);
  } else {
    digitalWrite(PIN_MOTOR, LOW);
  }

  String data = "{";
  data += "\"angle\":";
  data += inclinacion;
  data += ",\"bad_posture\":";
  data += abs(inclinacion) > UMBRAL_ANGULO ? "true" : "false";
  data += "}";

  webSocket.broadcastTXT(data);

  delay(300);
}