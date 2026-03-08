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
const int PIN_BOTON = 15;
const int UMBRAL_ANGULO = 25;

bool sistemaActivo = false;     // Controla si el corrector está trabajando
bool ultimoEstadoBoton = HIGH;
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
  randomSeed(analogRead(0)); // seed random generator
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
      Serial.println(">>> SISTEMA ON <<<");
    } else {
      Serial.println(">>> SISTEMA OFF <<<");
      digitalWrite(PIN_MOTOR, LOW); // Aseguramos que el motor se apague
    }
    delay(200); // Pequeño anti-rebote (debounce)
  }
  ultimoEstadoBoton = estadoActualBoton;
  // ---- LÓGICA PRINCIPAL (Solo si está activo) ----

  if (sistemaActivo) {

    // Aquí iría la lectura real del MPU6050
    
    // ---- MPU6050 SENSOR READ (DISABLED TEMPORARILY) ----
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    // imprimir aceleración
    Serial.print("X: ");
    Serial.print(a.acceleration.x);
    Serial.print("  Y: ");
    Serial.print(a.acceleration.y);
    Serial.print("  Z: ");
    Serial.println(a.acceleration.z);
    inclinacion = atan2(a.acceleration.y, a.acceleration.z) * 180 / M_PI;
    
  

    // ---- TEMPORARY RANDOM ANGLE ----

    //inclinacion = random(-45, 45); // Simulación



    if (abs(inclinacion) > UMBRAL_ANGULO) {

      digitalWrite(PIN_MOTOR, HIGH);

    } else {

      digitalWrite(PIN_MOTOR, LOW);

    }



    // Enviamos JSON con datos y estado "true"

    String data = "{\"angle\":" + String(inclinacion) +

                  ",\"bad_posture\":" + (abs(inclinacion) > UMBRAL_ANGULO ? "true" : "false") +

                  ",\"active\":true}";

    webSocket.broadcastTXT(data);

    Serial.println(data);



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