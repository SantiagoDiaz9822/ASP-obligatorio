// companyController.test.js
const {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyById,
} = require("../controllers/companyController");
const axios = require("axios");
const connection = require("../config/db");
const { Request, Response } = require("express");

jest.mock("axios");
jest.mock("../config/db", () => ({
  query: jest.fn(),
  connect: jest.fn(), // Mockea la conexión
  end: jest.fn(),
}));

describe("Company Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { name: "Company Name", address: "Company Address" },
      file: { location: "http://logo.url" },
      userId: 1,
      headers: { authorization: "Bearer token" },
      params: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCompany", () => {
    it("should create a company and return success", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { insertId: 1 });
      });

      axios.post.mockResolvedValueOnce({ data: "Success" });

      createCompany(req, res);

      setImmediate(() => {
        expect(connection.query).toHaveBeenCalledWith(
          "INSERT INTO companies (name, address, logo_url) VALUES (?, ?, ?)",
          ["Company Name", "Company Address", "http://logo.url"],
          expect.any(Function)
        );
        expect(axios.post).toHaveBeenCalledWith(
          `${process.env.AUDIT_SERVICE_URL}/log`,
          {
            action: "create",
            entity: "company",
            entityId: 1,
            details: {
              name: "Company Name",
              address: "Company Address",
              logoUrl: "http://logo.url",
            },
            userId: 1,
          },
          { headers: { Authorization: "Bearer token" } }
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Empresa creada exitosamente",
        });
        done();
      });
    });

    it("should handle error when query fails", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error("Database error"));
      });

      createCompany(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al crear la empresa.",
        });
        done();
      });
    });

    it("should handle error when audit service fails", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { insertId: 1 });
      });

      axios.post.mockRejectedValueOnce(new Error("Audit service error"));

      createCompany(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Empresa creada exitosamente",
        });
        done();
      });
    });
  });

  describe("deleteCompany", () => {
    it("should delete a company and return success", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      axios.post.mockResolvedValueOnce({ data: "Success" });

      deleteCompany(req, res);

      setImmediate(() => {
        expect(connection.query).toHaveBeenCalledWith(
          "DELETE FROM companies WHERE id = ?",
          [1],
          expect.any(Function)
        );
        expect(axios.post).toHaveBeenCalledWith(
          `${process.env.AUDIT_SERVICE_URL}/log`,
          {
            action: "delete",
            entity: "company",
            entityId: 1,
            details: { companyId: 1 },
            userId: 1,
          },
          { headers: { Authorization: "Bearer token" } }
        );
        expect(res.json).toHaveBeenCalledWith({
          message: "Empresa eliminada exitosamente",
        });
        done();
      });
    });

    it("should handle error when query fails", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error("Database error"));
      });

      deleteCompany(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al eliminar la empresa.",
        });
        done();
      });
    });

    it("should handle error when audit service fails", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, { affectedRows: 1 });
      });

      axios.post.mockRejectedValueOnce(new Error("Audit service error"));

      deleteCompany(req, res);

      setImmediate(() => {
        expect(res.json).toHaveBeenCalledWith({
          message: "Empresa eliminada exitosamente",
        });
        done();
      });
    });
  });

  describe("getAllCompanies", () => {
    it("should return all companies", (done) => {
      connection.query.mockImplementationOnce((query, callback) => {
        callback(null, [
          { id: 1, name: "Company 1" },
          { id: 2, name: "Company 2" },
        ]);
      });

      getAllCompanies(req, res);

      setImmediate(() => {
        expect(connection.query).toHaveBeenCalledWith(
          "SELECT * FROM companies",
          expect.any(Function)
        );
        expect(res.json).toHaveBeenCalledWith([
          { id: 1, name: "Company 1" },
          { id: 2, name: "Company 2" },
        ]);
        done();
      });
    });

    it("should handle error when query fails", (done) => {
      connection.query.mockImplementationOnce((query, callback) => {
        callback(new Error("Database error"));
      });

      getAllCompanies(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al obtener las empresas.",
        });
        done();
      });
    });
  });

  describe("getCompanyById", () => {
    it("should return a company by id", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, [{ id: 1, name: "Company 1" }]);
      });

      getCompanyById(req, res);

      setImmediate(() => {
        expect(connection.query).toHaveBeenCalledWith(
          "SELECT * FROM companies WHERE id = ?",
          [1],
          expect.any(Function)
        );
        expect(res.json).toHaveBeenCalledWith({ id: 1, name: "Company 1" });
        done();
      });
    });

    it("should return 404 if company not found", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(null, []);
      });

      getCompanyById(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Empresa no encontrada.",
        });
        done();
      });
    });

    it("should handle error when query fails", (done) => {
      connection.query.mockImplementationOnce((query, values, callback) => {
        callback(new Error("Database error"));
      });

      getCompanyById(req, res);

      setImmediate(() => {
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Error al obtener la empresa.",
        });
        done();
      });
    });
  });
});
