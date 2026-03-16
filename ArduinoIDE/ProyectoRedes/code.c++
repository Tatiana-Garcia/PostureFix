//Code after

#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebSocketsServer.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <math.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

const char* ssid = "Z16";
const char* password = "sistemas16";

WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_MPU6050 mpu;

#define PIN_MOTOR 18
#define PIN_BOTON 19
#define PIN_BATERIA 34

#define UMBRAL_ANGULO 15
#define EEPROM_SIZE 32

bool sistemaActivo = true;
bool ultimoEstadoBoton = HIGH;

float inclinacion = 0;
float offsetAngulo = 0;

float voltajeBateria = 0;
int porcentajeBateria = 0;

void guardarCalibracion(float angulo){
  EEPROM.put(0, angulo);
  EEPROM.commit();
}

void cargarCalibracion(){
  EEPROM.get(0, offsetAngulo);
}

float leerVoltajeBateria(){

  int raw = analogRead(PIN_BATERIA);

  float volt = (raw / 4095.0) * 3.3;

  volt = volt * 2; // divisor de voltaje

  return volt;
}

int calcularPorcentaje(float volt){

  if(volt >= 4.2) return 100;
  if(volt <= 3.3) return 0;

  return (volt - 3.3) * 100 / (4.2 - 3.3);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

  if(type == WStype_CONNECTED){
    Serial.println("Client connected");
  }

  if(type == WStype_DISCONNECTED){
    Serial.println("Client disconnected");
  }

  if(type == WStype_TEXT){

    DynamicJsonDocument doc(256);
    deserializeJson(doc, payload);

    String cmd = doc["command"];

    if(cmd == "calibrate"){

      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);

      offsetAngulo = atan2(a.acceleration.z, -a.acceleration.y) * 180 / M_PI;

      guardarCalibracion(offsetAngulo);

      webSocket.broadcastTXT("{\"calibration\":\"saved\"}");
    }

    if(cmd == "reset_calibration"){

      offsetAngulo = 0;
      guardarCalibracion(offsetAngulo);

      webSocket.broadcastTXT("{\"calibration\":\"reset\"}");
    }

    if(cmd == "sleep"){

      webSocket.broadcastTXT("{\"sleep\":\"true\"}");
      delay(200);

      esp_sleep_enable_ext0_wakeup(GPIO_NUM_19,0);
      esp_deep_sleep_start();
    }
  }
}

void setup() {

  Serial.begin(115200);

  pinMode(PIN_MOTOR, OUTPUT);
  pinMode(PIN_BOTON, INPUT_PULLUP);
  pinMode(PIN_BATERIA, INPUT);

  EEPROM.begin(EEPROM_SIZE);
  cargarCalibracion();

  Wire.begin();

  if (!mpu.begin()) {
    Serial.println("MPU6050 error");
    while (1) delay(10);
  }

  // Espera a que el sensor se estabilice
  delay(1000);

  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0) {
    Serial.println("Wakeup from button");
    delay(500);
  }

  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  if (!MDNS.begin("posturefix")) {
    Serial.println("Error starting mDNS");
  } else {
    Serial.println("mDNS started: posturefix.local");
  }

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("Sistema listo");
}

void loop() {

  webSocket.loop();

  bool estadoActualBoton = digitalRead(PIN_BOTON);

  if (ultimoEstadoBoton == HIGH && estadoActualBoton == LOW) {

    Serial.println("Entering deep sleep");

    delay(200);

    esp_sleep_enable_ext0_wakeup(GPIO_NUM_19,0);

    esp_deep_sleep_start();
  }

  ultimoEstadoBoton = estadoActualBoton;

  if (sistemaActivo) {

    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    if(isnan(a.acceleration.y) || isnan(a.acceleration.z)){
      Serial.println("Sensor not ready");
      delay(500);
      return;
    }

    float anguloCrudo = atan2(a.acceleration.z, -a.acceleration.y) * 180 / M_PI;

    inclinacion = anguloCrudo - offsetAngulo;

    if (inclinacion > 180) inclinacion -= 360;
    if (inclinacion < -180) inclinacion += 360;

    if (abs(inclinacion) > UMBRAL_ANGULO) {

      digitalWrite(PIN_MOTOR, HIGH);
      Serial.println("Mala postura");

    } else {

      digitalWrite(PIN_MOTOR, LOW);
      Serial.println("Postura correcta");
    }

    voltajeBateria = leerVoltajeBateria();
    porcentajeBateria = calcularPorcentaje(voltajeBateria);

    String data = "{";
    data += "\"angle\":" + String(inclinacion) + ",";
    data += "\"bad_posture\":" + String(abs(inclinacion) > UMBRAL_ANGULO ? "true" : "false") + ",";
    data += "\"active\":true,";
    data += "\"battery\":" + String(porcentajeBateria);
    data += "}";

    webSocket.broadcastTXT(data);

    Serial.println(data);
  }
  else {
    // Si está apagado, avisamos a la App que el sistema está en OFF
    // Esto es útil para que tu App de React Native muestre "Sistema Apagado"
    static unsigned long ultimaVezOff = 0;
    if (millis() - ultimaVezOff > 2000) { // Solo mandamos este aviso cada 2 seg para no saturar
      webSocket.broadcastTXT("{\"active\":false}");
      ultimaVezOff = millis();
    }
  }

  delay(500);
}







//Code Before
#include <WiFi.h>
#include <ESPmDNS.h>
#include <WebSocketsServer.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <math.h>

const char* ssid = "Z16";
const char* password = "sistemas16";

WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_MPU6050 mpu;

const int PIN_MOTOR = 18;
const int PIN_BOTON = 19;
const int UMBRAL_ANGULO = 15;

bool sistemaActivo = false;     // Controla si el corrector está trabajando
bool ultimoEstadoBoton = HIGH;
float inclinacion = 0;
float offsetAngulo = 0;

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
  pinMode(PIN_BOTON, INPUT_PULLUP); // Resistencia interna activa

  Wire.begin();
  Wire.setClock(10000);
  
  // ---- MPU6050 INIT (DISABLED TEMPORARILY) ----
  if (!mpu.begin()) {
    Serial.println("MPU6050 error");
    while (1) delay(10);
  }
  
  WiFi.disconnect(); // Limpia conexiones previas
  WiFi.mode(WIFI_STA); // Fuerza modo estación
  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  if (!MDNS.begin("posturefix")) {
    Serial.println("Error starting mDNS");
  } else {
    Serial.println("mDNS started: posturefix.local");
  }

  Serial.println("WebSocket server started on port 81");
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  //randomSeed(analogRead(0)); // activar para sin giroscopio temp
  Serial.println("Sistema en espera. Presiona el boton para iniciar.");
}

void loop() {
  webSocket.loop();
  
  // ---- LÓGICA DEL BOTÓN (ON/OFF) ----
  bool estadoActualBoton = digitalRead(PIN_BOTON);
  // Si el botón pasa de NO presionado (HIGH) a PRESIONADO (LOW)
  if (ultimoEstadoBoton == HIGH && estadoActualBoton == LOW) {
    sistemaActivo = !sistemaActivo; // Cambiamos el estado (Toggle)
    if (sistemaActivo) {
      // CALIBRAR: Al encender, leemos la posición actual y la definimos como 0 grados
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      offsetAngulo = atan2(a.acceleration.z, -a.acceleration.y) * 180 / M_PI;
      Serial.println(">>> SISTEMA ON (Calibrado) <<<");
    } else {
      Serial.println(">>> SISTEMA OFF <<<");
      digitalWrite(PIN_MOTOR, LOW); // Aseguramos que el motor se apague
    }
    delay(200); // Pequeño anti-rebote (debounce)
  }
  ultimoEstadoBoton = estadoActualBoton;
  // ---- LÓGICA PRINCIPAL (Solo si está activo) ----

  if (sistemaActivo) {
    // ---- MPU6050 SENSOR READ (DISABLED TEMPORARILY) ----
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    
    Serial.print("X: ");
    Serial.print(a.acceleration.x);
    Serial.print("  Y: ");
    Serial.print(a.acceleration.y);
    Serial.print("  Z: ");
    Serial.println(a.acceleration.z);
    
    // Aplicamos la calibración
    float anguloCrudo = atan2(a.acceleration.z, -a.acceleration.y) * 180 / M_PI;
    inclinacion = anguloCrudo - offsetAngulo;
    // NORMALIZACIÓN (Por si acaso alguien hace un mortal hacia atrás)
    if (inclinacion > 180) inclinacion -= 360;
    if (inclinacion < -180) inclinacion += 360;

    //inclinacion = random(-45, 45); // Simulación
    if (abs(inclinacion) > UMBRAL_ANGULO) {
      digitalWrite(PIN_MOTOR, HIGH);
      Serial.print("Mala Postura");
    } else {
      digitalWrite(PIN_MOTOR, LOW);
      Serial.print("Postura Correcta");
    }

    // Enviamos JSON con datos y estado "true"
    String data = "{\"angle\":" + String(inclinacion) +
                  ",\"bad_posture\":" + (abs(inclinacion) > UMBRAL_ANGULO ? "true" : "false") +
                  ",\"active\":true}";
    webSocket.broadcastTXT(data);
    Serial.println(data);
    // Debug
    Serial.print("X-Pitch: "); Serial.println(inclinacion);

  } else {
    // Si está apagado, avisamos a la App que el sistema está en OFF
    // Esto es útil para que tu App de React Native muestre "Sistema Apagado"
    static unsigned long ultimaVezOff = 0;
    if (millis() - ultimaVezOff > 2000) { // Solo mandamos este aviso cada 2 seg para no saturar
      webSocket.broadcastTXT("{\"active\":false}");
      ultimaVezOff = millis();
    }
  }
  delay(500);
}