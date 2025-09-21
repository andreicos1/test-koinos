const request = require("supertest");
const express = require("express");
const fs = require("fs").promises;

jest.mock("fs", () => {
  const actual = jest.requireActual("fs");
  return {
    ...actual,
    promises: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

const itemsRouter = require("../src/routes/items");

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/items", itemsRouter);
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message });
  });
  return app;
};

describe("Items API", () => {
  let app;
  let mockData;

  beforeEach(() => {
    app = makeApp();
    mockData = [
      { id: 1, name: "Alpha", price: 10 },
      { id: 2, name: "Beta", price: 20 },
      { id: 3, name: "Gamma", price: 30 },
    ];
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));
    fs.writeFile.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/items should return paginated items with total", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: mockData,
      total: mockData.length,
      page: 1,
      limit: 10,
    });
  });

  test("GET /api/items with ?q filter returns filtered data", async () => {
    const res = await request(app).get("/api/items?q=alp");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [{ id: 1, name: "Alpha", price: 10 }],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  test("GET /api/items with ?limit works", async () => {
    const res = await request(app).get("/api/items?limit=2");
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.total).toBe(3);
  });

  test("GET /api/items with ?page and ?limit works", async () => {
    const res = await request(app).get("/api/items?limit=1&page=2");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: 2, name: "Beta", price: 20 }]);
    expect(res.body.total).toBe(3);
  });

  test("GET /api/items/:id returns a single item", async () => {
    const res = await request(app).get("/api/items/2");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, name: "Beta", price: 20 });
  });

  test("GET /api/items/:id returns 404 when not found", async () => {
    const res = await request(app).get("/api/items/999");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Item not found");
  });

  test("POST /api/items should create and persist a new item", async () => {
    const newItem = { name: "Delta", price: 40 };
    const res = await request(app).post("/api/items").send(newItem);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toMatchObject({ name: "Delta", price: 40 });
    expect(fs.writeFile).toHaveBeenCalled();
  });
});
