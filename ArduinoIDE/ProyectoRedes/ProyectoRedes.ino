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
#define BATERIA_CRITICA 3.35

bool sistemaActivo = false;
bool ultimoEstadoBoton = HIGH;

float inclinacion = 0;
float offsetAngulo = 15;

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
  if(raw == 0) return 4.0; // simulación si no hay batería
  float volt = (raw / 4095.0) * 3.3;
  volt = volt * 2;
  return volt;
}

int calcularPorcentaje(float volt){
  if(volt >= 4.2) return 100;
  if(volt <= 3.3) return 0;
  return (volt - 3.3) * 100 / (4.2 - 3.3);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if(type == WStype_CONNECTED) Serial.println("Client connected");
  if(type == WStype_DISCONNECTED) Serial.println("Client disconnected");

  if(type == WStype_TEXT){
    DynamicJsonDocument doc(256);
    deserializeJson(doc, payload);

    String cmd = doc["command"];

    if(cmd == "calibrate"){
      sensors_event_t a,g,temp;
      mpu.getEvent(&a,&g,&temp);
      offsetAngulo = atan2(a.acceleration.z,-a.acceleration.y)*180/M_PI;
      guardarCalibracion(offsetAngulo);
      webSocket.broadcastTXT("{\"calibration\":\"saved\"}");
    }

    if(cmd == "sleep"){
      webSocket.broadcastTXT("{\"sleep\":true}");
      delay(200);
      esp_deep_sleep_start();
    }
  }
}

void enviarEstadoSistema(){
  // Enviamos JSON con el estado ON/OFF
  String data = "{";
  data += "\"angle\":" + String(inclinacion) + ",";
  data += "\"bad_posture\":" + String((abs(inclinacion) > UMBRAL_ANGULO) ? "true" : "false") + ",";
  data += "\"active\":" + String(sistemaActivo ? "true" : "false") + ",";
  data += "\"battery\":" + String(porcentajeBateria);
  data += "}";
  webSocket.broadcastTXT(data);
  Serial.println(data);
}

void setup(){
  Serial.begin(115200);
  pinMode(PIN_MOTOR,OUTPUT);
  pinMode(PIN_BOTON,INPUT_PULLUP);
  pinMode(PIN_BATERIA,INPUT);

  EEPROM.begin(EEPROM_SIZE);
  cargarCalibracion();

  Wire.begin();
  Wire.setClock(100000);

  if(!mpu.begin()){
    Serial.println("MPU6050 error");
    while(1) delay(10);
  }

  delay(1000);

  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid,password);

  Serial.print("Connecting");
  while(WiFi.status()!=WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println(WiFi.localIP());

  MDNS.begin("posturefix");

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("Sistema listo");
}

void loop(){
  webSocket.loop();

  bool estadoActualBoton = digitalRead(PIN_BOTON);

  // Detectamos cambio de estado del botón
  if(ultimoEstadoBoton==HIGH && estadoActualBoton==LOW){
    sistemaActivo = !sistemaActivo; // Toggle ON/OFF

    if(sistemaActivo){
      Serial.print("offset: ");
      Serial.println(offsetAngulo);
      Serial.println(">>> SISTEMA ON <<<");
    }else{
      Serial.println(">>> SISTEMA OFF <<<");
      digitalWrite(PIN_MOTOR,LOW);
    }

    // Enviamos estado inmediatamente al cambiar
    enviarEstadoSistema();

    delay(200); // anti-rebote
  }
  ultimoEstadoBoton = estadoActualBoton;

  if(sistemaActivo){
    sensors_event_t a,g,temp;
    mpu.getEvent(&a,&g,&temp);
    float anguloCrudo = atan2(a.acceleration.z,-a.acceleration.y)*180/M_PI;
    inclinacion = anguloCrudo - offsetAngulo;
    if(inclinacion>180) inclinacion-=360;
    if(inclinacion<-180) inclinacion+=360;

    if(abs(inclinacion)>UMBRAL_ANGULO){
      digitalWrite(PIN_MOTOR,HIGH);
      Serial.print("Mala postura");
    }else{
      digitalWrite(PIN_MOTOR,LOW);
      Serial.print("Postura correcta");
    }

    voltajeBateria = leerVoltajeBateria();
    porcentajeBateria = calcularPorcentaje(voltajeBateria);

    // Enviamos estado periódicamente
    enviarEstadoSistema();
  }else{
    static unsigned long ultimaVezOff=0;
    if(millis()-ultimaVezOff>2000){
      // Mantener actualizado el OFF a la app
      enviarEstadoSistema();
      ultimaVezOff=millis();
    }
  }

  delay(500);
}