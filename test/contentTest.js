const mongoose = require("mongoose");
const Content = require("../models/content");
const request = require("supertest");
const app = require("../app.js"); // Import Express app
const user = require("../models/user");
const jwt = require("jsonwebtoken");

let token;

describe("APIs", () => {
  let reqUser;
  const signedUserId = new mongoose.Types.ObjectId();
  const NewContentId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    reqUser = {
      body: {
        userName: "mo ramadan",
        email: "medo.ramadan2002@gmail.com",
        password: "Medo2002",
        passwordConfirm: "Medo2002",
        gender: "Male",
        age: 22,
      },
    };

    jest
      .spyOn(user, "create")
      .mockResolvedValue({ ...reqUser.body, _id: signedUserId });

    const res = await request(app).post("/signup").send(reqUser.body);

    expect(res.body).toHaveProperty("status", "success");
    expect(res.body.data).toMatchObject(reqUser.body);
  });

  beforeAll(async () => {
    jest
      .spyOn(user, "findOne")
      .mockResolvedValue({ ...reqUser.body, _id: signedUserId });
    jest.spyOn(jwt, "sign").mockReturnValue("testToken123");

    const res = await request(app)
      .post("/login")
      .send({ email: reqUser.body.email, password: reqUser.body.password });

    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Add A Content", async () => {
    jest.mock("multer", () => ({
      ...jest.requireActual("multer"),
      multer: jest.fn(() => ({
        single: jest.fn(() => (req, res, next) => {
          req.file = { path: "../data/favorites" };
          next();
        }),
      })),
    }));
    const req = {
      body: {
        title: "Avengers 2",
        description: "Avengers came back to save the world again from evil",
        category: "Movie",
        duration: 120,
        parentalGuide: "+18",
        genre: ["Thriller", "Action", "SuperHero"],
        rating: 9,
        quality: "HD-TS",
        castCrew: ["5fa1c587ae2ac23e9c46510f"],
        production: "MARVEL",
      },
      file: { path: "../data/favorites" },
    };

    jest
      .spyOn(Content.prototype, "save")
      .mockResolvedValue({ ...req.body, _id: NewContentId });

    const res = await request(app)
      .post("/content")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...req.body, imageUrl: req.file.path });

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    expect(res.body).toHaveProperty("status", "success");
  });

  it("Update A Content", async () => {
    jest.mock("multer", () => ({
      ...jest.requireActual("multer"),
      multer: jest.fn(() => ({
        single: jest.fn(() => (req, res, next) => {
          req.file = { path: "../data/favorites" };
          next();
        }),
      })),
    }));
    const req = {
      params: { id: NewContentId },
      body: {
        title: "Avengers 2",
        description: "Avengers came back to save the world again from evil",
        category: "Movie",
        duration: 120,
        parentalGuide: "+18",
        genre: ["Thriller", "Action", "SuperHero"],
        rating: 9,
        quality: "HD-TS",
        castCrew: ["5fa1c587ae2ac23e9c46510f"],
        production: "MARVEL",
      },
      file: { path: "../data/favorites" },
    };

    jest.spyOn(Content, "findByIdAndUpdate").mockResolvedValue(req.body);

    const res = await request(app)
      .patch(`/content/${req.params.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...req.body, imageUrl: req.file.path });

    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject(req.body);
  });

  it("Delete A Content", async () => {
    const req = { params: { id: NewContentId } };

    jest.spyOn(Content, "findByIdAndDelete").mockResolvedValue();

    const res = await request(app)
      .delete(`/content/${req.params.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.body).toHaveProperty("status", "success");
  });

  it("Get All Content", async () => {
    jest.spyOn(Content, "find").mockResolvedValue([
      {
        _id: new mongoose.Types.ObjectId(),
        title: "Inception",
        description: "A mind-bending thriller about dreams within dreams.",
        category: "Movie",
      },
    ]);

    const res = await request(app).get("/content");

    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("Save The Content Link To The DB", async () => {
    const req = {
      params: { id: NewContentId },
      body: {
        contentLink: "Avengers2",
      },
    };

    const stub = jest
      .spyOn(Content, "findByIdAndUpdate")
      .mockResolvedValue(req.body);

    const res = await request(app)
      .patch(`/content/${req.params.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ...req.body, imageUrl: req.file.path });

    expect(res.body).toHaveProperty("status", "success");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject(req.body);

    stub.mockRestore();
  });
});

module.exports = token;
