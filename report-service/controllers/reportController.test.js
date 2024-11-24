const {
  registerUsageLog,
  getUsageReport,
} = require("../controllers/reportController"); // Importamos las funciones
const connection = require("../config/db"); // Asegúrate de que esta ruta es correcta

jest.mock("../config/db", () => ({
  query: jest.fn(),
  connect: jest.fn(), // Mockea la conexión
  end: jest.fn(),
}));

describe("reportController", () => {
  // Test para la función registerUsageLog
  describe("registerUsageLog", () => {
    it("debe registrar un log de uso exitosamente", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(null, [])
      ); // Mock de la consulta exitosa
      connection.query = mockQuery;

      const req = {
        body: {
          feature_id: 1,
          project_id: 1,
          context: { key: "value" },
          response: true,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      registerUsageLog(req, res);

      setImmediate(() => {
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("INSERT INTO usage_logs"),
          [1, 1, '{"key":"value"}', true],
          expect.any(Function)
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Log de uso registrado exitosamente.",
        });
        done();
      });
    });

    it("debe devolver error 400 cuando los datos son inválidos", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(null, [])
      ); // Mock de la consulta exitosa
      connection.query = mockQuery;

      const req = {
        body: {
          feature_id: 1,
          project_id: 1,
          context: { key: "value" },
          // Falta 'response'
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      registerUsageLog(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Datos inválidos." });
        done();
      });
    });

    it("debe devolver error 500 cuando hay un error al registrar el log", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(new Error("DB Error"), [])
      ); // Simulamos un error
      connection.query = mockQuery;

      const req = {
        body: {
          feature_id: 1,
          project_id: 1,
          context: { key: "value" },
          response: true,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      registerUsageLog(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al registrar el log de uso.",
        });
        done();
      });
    });
  });

  // Test para la función getUsageReport
  describe("getUsageReport", () => {
    it("debe devolver el reporte de uso correctamente", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(null, [
          {
            project_id: 1,
            feature_id: 1,
            usage_count: 5,
            hour: "2024-11-23 10:00:00",
          },
        ])
      ); // Datos simulados
      connection.query = mockQuery;

      const req = {
        query: {
          start_date: "2024-11-23 00:00:00",
          end_date: "2024-11-23 23:59:59",
          project_id: 1,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      getUsageReport(req, res);

      setImmediate(() => {
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("SELECT"),
          ["2024-11-23 00:00:00", "2024-11-23 23:59:59", 1],
          expect.any(Function)
        );
        expect(res.json).toHaveBeenCalledWith({
          data: [
            {
              project_id: 1,
              feature_id: 1,
              usage_count: 5,
              hour: "2024-11-23 10:00:00",
            },
          ],
        });
        done();
      });
    });

    it("debe devolver error 400 si falta el rango de fechas", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(null, [])
      ); // Mock de la consulta
      connection.query = mockQuery;

      const req = {
        query: {
          project_id: 1,
          feature_id: 1,
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      getUsageReport(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "Rango de fechas requerido.",
        });
        done();
      });
    });

    it("debe devolver error 500 si hay un error al obtener el reporte", (done) => {
      const mockQuery = jest.fn((query, params, callback) =>
        callback(new Error("DB Error"), [])
      ); // Simulamos un error
      connection.query = mockQuery;

      const req = {
        query: {
          start_date: "2024-11-23 00:00:00",
          end_date: "2024-11-23 23:59:59",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      getUsageReport(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al obtener el reporte de uso.",
        });
        done();
      });
    });
    it("debe aplicar filtro por feature_id si se pasa en la solicitud", (done) => {
      const feature_id = 1; // Agregamos un feature_id para el filtro

      connection.query.mockImplementation((query, params, callback) => {
        callback(null, [
          {
            project_id: 1,
            feature_id: feature_id,
            usage_count: 5,
            hour: "2024-11-23 10:00:00",
          },
        ]); // Datos simulados
      });

      const req = {
        query: {
          start_date: "2024-11-23 00:00:00",
          end_date: "2024-11-23 23:59:59",
          project_id: 1,
          feature_id: feature_id, // Incluimos el feature_id en la consulta
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      getUsageReport(req, res);

      setImmediate(() => {
        // Verificamos que el query contiene el filtro por feature_id
        expect(connection.query).toHaveBeenCalledWith(
          expect.stringContaining("SELECT"),
          ["2024-11-23 00:00:00", "2024-11-23 23:59:59", 1, feature_id], // Los parámetros ahora incluyen el feature_id
          expect.any(Function)
        );
        expect(res.json).toHaveBeenCalledWith({
          data: [
            {
              project_id: 1,
              feature_id: feature_id,
              usage_count: 5,
              hour: "2024-11-23 10:00:00",
            },
          ],
        });
        done();
      });
    });
  });
});
