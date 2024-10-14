const express = require("express");
const request = require("supertest");
const connection = require("../db");
const auth = require("../middleware/auth");
const projects = require("../routes/projects");
const { validationResult } = require("express-validator");

// Mock del middleware de autenticación
jest.mock("../middleware/auth");

// Mock de la conexión a la base de datos
jest.mock("../db", () => ({
  query: jest.fn(),
}));

// Inicializa la aplicación Express
const app = express();
app.use(express.json());
app.use("/projects", projects);

describe("Projects API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockImplementation((req, res, next) => {
      req.userId = "mockUserId"; // Mockea el userId
      next();
    });
  });

  describe("POST /projects/new", () => {
    it("debería devolver un error 400 si falta el nombre o la descripción", async () => {
      const response = await request(app).post("/projects/new").send({});
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual([
        {
          location: "body",
          msg: "El nombre del proyecto es requerido.",
          path: "name", 
          type: "field", 
        },
        {
          location: "body",
          msg: "La descripción es requerida.",
          path: "description", 
          type: "field", 
        },
      ]);
    });

    it("debería crear un nuevo proyecto y devolver un API Key", async () => {
      const mockUserResults = [{ company_id: 1 }];
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(null, mockUserResults);
        } else if (query.includes("INSERT INTO projects")) {
          callback(null, { insertId: 1 });
        } else if (query.includes("UPDATE projects SET api_key =")) {
          callback(null);
        }
      });

      const response = await request(app)
        .post("/projects/new")
        .send({ name: "Project A", description: "Description A" });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Proyecto creado exitosamente",
        projectId: 1,
        apiKey: expect.any(String),
      });
    });

    it("debería manejar errores al crear un proyecto", async () => {
      const mockUserResults = [{ company_id: 1 }];
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(null, mockUserResults);
        } else if (query.includes("INSERT INTO projects")) {
          callback(new Error("Error al crear el proyecto"));
        }
      });

      const response = await request(app)
        .post("/projects/new")
        .send({ name: "Project A", description: "Description A" });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al crear el proyecto.",
      });
    });

    it("debería devolver un error 500 si hay un problema al obtener la empresa del usuario", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users WHERE id = ?")) {
          callback(new Error("Error al obtener la empresa del usuario")); 
        }
      });

      const response = await request(app).post("/projects/new").send({
        name: "Project A",
        description: "Description A",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al obtener la empresa del usuario.",
      });
    });

    it("debería devolver un error 404 si el usuario no es encontrado", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users WHERE id = ?")) {
          callback(null, []); 
        }
      });

      const response = await request(app).post("/projects/new").send({
        name: "Project A",
        description: "Description A",
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Usuario no encontrado.",
      });
    });

    it("debería devolver un error 500 si hay un problema al asignar el API Key", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users WHERE id = ?")) {
          callback(null, [{ company_id: 1 }]);
        } else if (query.includes("INSERT INTO projects")) {
          callback(null, { insertId: 1 });
        } else if (query.includes("UPDATE projects SET api_key =")) {
          callback(new Error("Error al asignar el API Key")); 
        }
      });

      const response = await request(app).post("/projects/new").send({
        name: "Project A",
        description: "Description A",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al asignar el API Key.",
      });
    });
  });

  describe("GET /projects", () => {
    it("debería devolver un error 500 si hay un problema al obtener la empresa del usuario", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(new Error("Error al obtener la empresa del usuario"));
        }
      });

      const response = await request(app).get("/projects");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al obtener la empresa.",
      });
    });

    it("debería devolver un error 500 si hay un problema con la base de datos al obtener los proyectos", async () => {
      const mockUserResults = [{ company_id: 1 }];
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(null, mockUserResults);
        } else if (query.includes("SELECT * FROM projects")) {
          callback(new Error("Error al obtener los proyectos"));
        }
      });

      const response = await request(app).get("/projects");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al obtener los proyectos.",
      });
    });

    it("debería manejar el caso en el que no hay proyectos disponibles", async () => {
      const mockUserResults = [{ company_id: 1 }];
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(null, mockUserResults);
        } else if (query.includes("SELECT * FROM projects")) {
          callback(null, []);
        }
      });

      const response = await request(app).get("/projects");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]); 
    });

    it("debería devolver una lista de proyectos exitosamente", async () => {
      const mockUserResults = [{ company_id: 1 }];
      const mockProjects = [
        { id: 1, name: "Project A", description: "Description A" },
        { id: 2, name: "Project B", description: "Description B" },
      ];

      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users")) {
          callback(null, mockUserResults);
        } else if (query.includes("SELECT * FROM projects")) {
          callback(null, mockProjects);
        }
      });

      const response = await request(app).get("/projects");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProjects);
    });

    it("debería devolver un error 404 si el usuario no es encontrado al obtener los proyectos", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM users WHERE id = ?")) {
          callback(null, []);
        }
      });

      const response = await request(app).get("/projects");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Usuario no encontrado.",
      });
    });
  });

  describe("GET /projects/:id", () => {
    it("debería devolver un proyecto si existe", async () => {
      const mockProject = {
        id: 1,
        name: "Project A",
        description: "Description A",
      };

      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT * FROM projects WHERE id = ?")) {
          callback(null, [mockProject]);
        }
      });

      const response = await request(app).get("/projects/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProject);
    });

    it("debería devolver un 404 si el proyecto no existe", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT * FROM projects WHERE id = ?")) {
          callback(null, []); 
        }
      });

      const response = await request(app).get("/projects/999");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Proyecto no encontrado." });
    });

    it("debería devolver un error 500 si hay un problema con la base de datos", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT * FROM projects WHERE id = ?")) {
          callback(new Error("Error al obtener el proyecto"));
        }
      });

      const response = await request(app).get("/projects/1");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al obtener el proyecto.",
      });
    });
  });

  describe("GET /projects/:id/features", () => {
    it("debería devolver todas las features del proyecto si el usuario tiene acceso", async () => {
      const mockFeatures = [
        {
          id: 1,
          name: "Feature A",
          description: "Feature A description",
          project_id: 1,
        },
        {
          id: 2,
          name: "Feature B",
          description: "Feature B description",
          project_id: 1,
        },
      ];

      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM projects WHERE id = ?")) {
          callback(null, [{ company_id: 1 }]);
        } else if (
          query.includes("SELECT * FROM features WHERE project_id = ?")
        ) {
          callback(null, mockFeatures); 
        }
      });

      const response = await request(app).get("/projects/1/features");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFeatures);
    });

    it("debería devolver un 403 si el usuario no tiene acceso al proyecto", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM projects WHERE id = ?")) {
          callback(null, []);
        }
      });

      const response = await request(app).get("/projects/999/features");
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        message: "No tienes acceso a este proyecto.",
      });
    });

    it("debería devolver un error 500 si hay un problema al verificar el proyecto", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM projects WHERE id = ?")) {
          callback(new Error("Error al verificar el proyecto"));
        }
      });

      const response = await request(app).get("/projects/1/features");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al verificar el proyecto.",
      });
    });

    it("debería devolver un error 500 si hay un problema al obtener las features", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (query.includes("SELECT company_id FROM projects WHERE id = ?")) {
          callback(null, [{ company_id: 1 }]); 
        } else if (
          query.includes("SELECT * FROM features WHERE project_id = ?")
        ) {
          callback(new Error("Error al obtener las features")); 
        }
      });

      const response = await request(app).get("/projects/1/features");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al obtener las features.",
      });
    });
  });

  describe("DELETE /projects/:id", () => {
    it("debería eliminar el proyecto si no tiene features", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (
          query.includes(
            "SELECT COUNT(*) AS count FROM features WHERE project_id = ?"
          )
        ) {
          callback(null, [{ count: 0 }]); 
        } else if (query.includes("DELETE FROM projects WHERE id = ?")) {
          callback(null, { affectedRows: 1 }); 
        }
      });

      const response = await request(app).delete("/projects/1");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Proyecto eliminado exitosamente",
      });
    });

    it("debería devolver un error 400 si el proyecto tiene features asociadas", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (
          query.includes(
            "SELECT COUNT(*) AS count FROM features WHERE project_id = ?"
          )
        ) {
          callback(null, [{ count: 5 }]); 
        }
      });

      const response = await request(app).delete("/projects/1");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          "No se puede eliminar un proyecto que tiene features asociadas.",
      });
    });

    it("debería devolver un error 404 si el proyecto no existe", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (
          query.includes(
            "SELECT COUNT(*) AS count FROM features WHERE project_id = ?"
          )
        ) {
          callback(null, [{ count: 0 }]);
        } else if (query.includes("DELETE FROM projects WHERE id = ?")) {
          callback(null, { affectedRows: 0 }); 
        }
      });

      const response = await request(app).delete("/projects/999");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Proyecto no encontrado." });
    });

    it("debería devolver un error 500 si hay un problema al verificar las features", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (
          query.includes(
            "SELECT COUNT(*) AS count FROM features WHERE project_id = ?"
          )
        ) {
          callback(new Error("Error al verificar las features"));
        }
      });

      const response = await request(app).delete("/projects/1");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al verificar las features.",
      });
    });

    it("debería devolver un error 500 si hay un problema al eliminar el proyecto", async () => {
      connection.query.mockImplementation((query, params, callback) => {
        if (
          query.includes(
            "SELECT COUNT(*) AS count FROM features WHERE project_id = ?"
          )
        ) {
          callback(null, [{ count: 0 }]);
        } else if (query.includes("DELETE FROM projects WHERE id = ?")) {
          callback(new Error("Error al eliminar el proyecto"));
        }
      });

      const response = await request(app).delete("/projects/1");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Error al eliminar el proyecto.",
      });
    });
  });
});
