import { useRef, useState } from "react";

const WS_URL = "ws://10.137.18.68:81";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [angle, setAngle] = useState(0);
  const [isBadPosture, setIsBadPosture] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [active, setActive] = useState(false);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("ESP32 connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (typeof data.angle === "number") setAngle(data.angle);
        if (typeof data.bad_posture === "boolean") setIsBadPosture(data.bad_posture);
        if (typeof data.battery === "number") {
          setBatteryLevel(Math.max(0, Math.min(100, data.battery)));
        }
        if (typeof data.active === "boolean") setActive(data.active);

      } catch {
        console.error("Invalid WS message:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      console.log("ESP32 disconnected");
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
  };

  const send = (data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return {
    connect,
    disconnect,
    send,
    isConnected,
    angle,
    isBadPosture,
    batteryLevel,
    active,
  };
}