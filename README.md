# SpineGuard - Corrector de Postura Inteligente 
   #### Proyecto final de la clase **Introducción a Redes**. 

<img width="1600" height="1200" alt="image" src="https://github.com/user-attachments/assets/d006237e-6d7a-453c-be58-554b98fa37d9" />

SpineGuard es un prototipo funcional que combina **hardware IoT** y **aplicaciones móviles** para mejorar la postura de los usuarios. Aunque limitado a un entorno académico, demuestra el potencial de los sistemas portátiles inteligentes en el ámbito de la salud y la ingeniería. 

---

## 👥 Integrantes del equipo
- Andrea Gabriela Zelaya Flores (12241001)
- Andrea Sofía Vallejo Zúñiga (12341133)
- Tatiana Zuseth García Ferrufino (12241079)

---

## 🎯 Objetivo General
Desarrollar e implementar un sistema corrector de postura basado en un dispositivo **wearable tipo collar**, utilizando un **sensor giroscópico** y un **ESP32**, capaz de monitorear la inclinación del usuario y transmitir datos en tiempo real a una aplicación móvil para la detección y prevención de malas posturas.

---

## 📌 Objetivos Específicos
- Diseñar la arquitectura del sistema integrando giroscopio, ESP32 y comunicación inalámbrica.  
- Implementar adquisición de datos para medir inclinación y orientación.  
- Transmitir datos vía **WiFi/Bluetooth** hacia un dispositivo móvil.  
- Evaluar precisión, respuesta y consumo energético del prototipo.  
- Proponer mejoras para optimizar el sistema y ampliar aplicaciones en salud e ingeniería.  

---

## 📐 Alcance del Proyecto
El dispositivo:
- Monitorea en tiempo real el ángulo de inclinación del torso.  
- Procesa la información localmente en el ESP32.  
- Envía alertas inmediatas mediante vibración y notificaciones en la app.  
- La aplicación móvil permite:
  - Iniciar sesiones de uso.  
  - Almacenar estadísticas de postura correcta/incorrecta.  
  - Calibrar el ángulo según la altura del usuario.  

> ⚠️ Nota: El prototipo es funcional pero **no incluye validación clínica profesional**.

---

## ⚙️ Materiales y Lenguajes de Programación

### Componentes
- Batería LiPo recargable 3.7V 650mAh  
- Módulo de motor vibrador  
- Sensor giroscopio **MPU6500 GY-6500**  
- Tarjeta de desarrollo **ESP32 con WiFi**  
- Cargador de batería USB-C TP4056  
- Push button  
- Regulador MT3608 a 5V  
- Case hecho en **plywood**  

### Equipo
- Cautín y estaño  
- Cortadora láser  
- Computadora  
- Software **SolidWorks** para diseño del case  

### Programación
- **ESP32:** C++ (Arduino IDE, librerías: WiFi, WebSockets, Adafruit, ArduinoJson, etc.)  
- **App móvil:** React Native con **TypeScript/JavaScript**, WebSocket API  

---

## 🔧 Diseño del Sistema

### Lógico
<img width="450" height="226" alt="image" src="https://github.com/user-attachments/assets/dccf3a5d-90e1-4183-83ba-4784d5814b94" />

- El giroscopio mide la inclinación del cuerpo.  
- El ESP32 procesa los datos y activa el vibrador si se supera el umbral (15°).  
- Comunicación con la app vía **WiFi + WebSockets**.  
- Alimentación mediante batería LiPo + regulador MT3608 a 5V.


### Case
<img width="396" height="313" alt="image" src="https://github.com/user-attachments/assets/a563adec-1a3c-4ba8-8a81-8adff96adea0" />

- Diseñado en **SolidWorks**, inspirado en el reactor de Tony Stark (Infinity War).  
- Fabricado en madera ligera, pintado y ensamblado con super glue y velcro.  
- Compacto y ergonómico para comodidad del usuario.  


---

## 📱 Aplicación Móvil
<img width="606" height="265" alt="image" src="https://github.com/user-attachments/assets/f8918ac5-5224-486c-8d02-b5380a7f0cc6" />

- Pantalla principal: estado de conexión, actividad, ángulo en tiempo real, inicio de sesiones.  
- Estadísticas: tiempo total en postura correcta/incorrecta, gráfico de últimas 7 sesiones.  
- Configuración: calibración del dispositivo (3 segundos en postura correcta).  
- Conexión persistente mediante **WebSockets**.  
- Datos enviados en formato **JSON**.


---

## 🛠️ Problemas y Soluciones
1. **Compatibilidad de librerías ESP32** → Se usó versión estable (2.0.17).  
2. **Cable USB insuficiente** → Reemplazado por uno de mayor calidad.  
3. **Voltaje insuficiente (3.7V)** → Se implementó módulo elevador a 5V.  
4. **Componentes defectuosos** → Sustituidos por nuevos.  

---

## 👥 Colaboradores GitHub

<table border="0">
  <tr>
    <td align="center">
      <a href="https://github.com/agzelaya">
        <img src="https://github.com/agzelaya.png" width="90px;" alt="Andrea G. Zelaya"/><br />
        <b>Andrea G. Zelaya</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Tatiana-Garcia">
        <img src="https://github.com/Tatiana-Garcia.png" width="90px;" alt="Tatiana Z. Garcia"/><br />
        <b>Tatiana Z. Garcia</b>
      </a>
    </td>
  </tr>
</table>


