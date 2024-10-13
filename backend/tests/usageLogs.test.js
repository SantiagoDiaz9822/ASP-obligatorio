const express = require("express");
const request = require("supertest");
const connection = require("../db");
const auth = require("../middleware/auth");
const usageLogs = require("../routes/usageLogs");

// Mock del middleware de autenticación
jest.mock("../middleware/auth");

// Mock de la conexión a la base de datos
jest.mock("../db", () => ({
  query: jest.fn(),
}));

// Mock de Redis
jest.mock("redis", () => ({
  createClient: jest.fn(
    () =>
      (mockRedisClient = {
        get: jest.fn(),
        setEx: jest.fn(),
        connect: jest.fn(),
        on: jest.fn(),
      })
  ),
}));

// Inicializa la aplicación Express
const app = express();
app.use(express.json());
app.use("/usage-logs", usageLogs);

describe("GET /usage-logs/report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockImplementation((req, res, next) => {
      req.userId = "mockUserId"; // Mockea el userId
      next();
    });
  });

  it("debería devolver un error 400 si no se proporcionan fechas", async () => {
    const response = await request(app).get("/usage-logs/report");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Se requieren las fechas de inicio y fin.",
    });
  });

  it("debería devolver datos en caché si están disponibles", async () => {
    mockRedisClient.get.mockResolvedValueOnce(
      JSON.stringify([
        {
          project_name: "Project A",
          feature_key: "Feature 1",
          usage_count: 10,
        },
      ])
    );
    const response = await request(app).get(
      "/usage-logs/report?startDate=2024-01-01&endDate=2024-01-31"
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { project_name: "Project A", feature_key: "Feature 1", usage_count: 10 },
    ]);
    expect(mockRedisClient.get).toHaveBeenCalledWith(
      "usage_report_mockUserId_2024-01-01_2024-01-31"
    );
  });

  it("debería consultar la base de datos y devolver resultados", async () => {
    const mockResults = [
      { project_name: "Project A", feature_key: "Feature 1", usage_count: 10 },
    ];
    connection.query.mockImplementation((query, params, callback) => {
      callback(null, mockResults);
    });

    const response = await request(app).get(
      "/usage-logs/report?startDate=2024-01-01&endDate=2024-01-31"
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResults);
    expect(mockRedisClient.setEx).toHaveBeenCalledWith(
      "usage_report_mockUserId_2024-01-01_2024-01-31",
      3600,
      JSON.stringify(mockResults)
    );
  });

  it("debería manejar errores de la base de datos", async () => {
    connection.query.mockImplementation((query, params, callback) => {
      callback(new Error("Error de base de datos"));
    });

    const response = await request(app).get(
      "/usage-logs/report?startDate=2024-01-01&endDate=2024-01-31"
    );
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Error al obtener el reporte de uso.",
    });
  });

  it("debería manejar errores del caché", async () => {
    mockRedisClient.get.mockRejectedValueOnce(new Error("Error en Redis"));
    const response = await request(app).get(
      "/usage-logs/report?startDate=2024-01-01&endDate=2024-01-31"
    );
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Error de servidor." });
  });
});
