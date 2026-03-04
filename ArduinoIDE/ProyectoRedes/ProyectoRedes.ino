#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <math.h> // Para calcular el ángulo

Adafruit_MPU6050 mpu;

const int PIN_MOTOR = 18;       // Pin donde conectas el IN del motor
const int UMBRAL_ANGULO = 25;    // Grados de inclinación para activar vibración

void setup(void) {
  Serial.begin(115200);
  pinMode(PIN_MOTOR, OUTPUT);
  digitalWrite(PIN_MOTOR, LOW); // Motor apagado al inicio

  Wire.begin();
  // Velocidad ultra lenta para jumpers inestables
  Wire.setClock(10000); 

  if (!mpu.begin()) {
    Serial.println("No se encontro el MPU6050. ¡Revisa los cables!");
    while (1) { delay(10); }
  }

  Serial.println("Corrector de Postura Iniciado...");
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  /* CALCULO DE INCLINACIÓN */
  // Usamos el eje Y y Z para calcular el ángulo en grados
  // La fórmula es: Angulo = atan2(y, z) * 180 / PI
  float inclinacion = atan2(a.acceleration.y, a.acceleration.z) * 180 / M_PI;

  Serial.print("Inclinacion: ");
  Serial.print(inclinacion);
  Serial.println(" °");

  /* LÓGICA DEL MOTOR */
  // Si la inclinación es mayor al umbral, ¡VIBRA!
  // Usamos abs() por si el sensor está invertido
  if (abs(inclinacion) > UMBRAL_ANGULO) {
    digitalWrite(PIN_MOTOR, HIGH); 
    Serial.println("¡ENDERÉZATE! (Motor ON)");
  } else {
    digitalWrite(PIN_MOTOR, LOW);
    Serial.println("Buena postura (Motor OFF)");
  }

  delay(300); // Pequeña pausa para no saturar el monitor
}