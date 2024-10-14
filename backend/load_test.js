import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50, // Número de usuarios virtuales
  duration: "2m", // Duración de la prueba
  thresholds: {
    http_req_duration: ["p(95)<200"], // El 95% de las solicitudes deben responder en menos de 200 ms
    http_req_failed: ["rate<0.01"], // La tasa de fallos debe ser menor al 1%
  },
};

const BASE_URL = "http://localhost:3000/v1/features/use_sort_algorithm"; // Cambia esto por la URL de tu endpoint

export default function () {
  const body = {
    country: "uy",
    age: "22",
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: "925509acc7645e3637834b9a2857a713cd63e7fe", // Tu token de autorización
  };

  const response = http.post(BASE_URL, JSON.stringify(body), { headers });

  // Verifica que la respuesta sea correcta
  check(response, {
    "is status 200": (r) => r.status === 200,
    "is feature enabled": (r) => r.json().value !== undefined,
  });

  sleep(1); // Espera 1 segundo entre las solicitudes
}
