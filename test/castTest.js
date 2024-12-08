const mongoose = require("mongoose");
const Content = require("../models/content");
const request = require("supertest");
const app = require("../app.js"); // Import Express app
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const Cast = require("../models/cast");

let { token } = require("../test/contentTest");

describe("APIs", () => {
  const newCastId = new mongoose.Types.ObjectId();
  const castContentId = new mongoose.Types.ObjectId();

  describe("CAST", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("Add A Cast", async () => {
      const req = {
        body: {
          name: "Sharukan",
          age: 52,
          classification: "Actor",
          content: [castContentId],
        },
        file: {
          path: "",
        },
      };

      jest
        .spyOn(Cast.prototype, "save")
        .mockResolvedValue({ ...req.body, _id: newCastId });

      const res = await request(app)
        .post("/cast")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...req.body, imageUrl: req.file.path });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
    });

    it("Update A Cast Member Info", async () => {
      const req = {
        params: { id: newCastId },
        body: {
          name: "Sharukhan Updated",
        },
      };

      jest.spyOn(Cast, "findByIdAndUpdate").mockResolvedValue({
        name: "Sharukhan Updated",
        age: 52,
        classification: "Actor",
        content: [castContentId],
      });

      const res = await request(app)
        .patch(`/cast/${req.params.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(req.body);

      expect(res.body).toHaveProperty("status", "success");
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toMatchObject(req.body);
    });

    it("Get All Cast", async () => {
      jest.spyOn(Cast, "find").mockResolvedValue([
        {
          _id: newCastId,
          name: "Sharukhan",
          age: 52,
          classification: "Actor",
          content: [castContentId],
        },
      ]);

      const res = await request(app).get("/cast");

      expect(res.body).toHaveProperty("status", "success");
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("Remove Cast Member From Content", async () => {
      const req = {
        params: { id: castContentId },
      };

      jest.spyOn(Content, "findById").mockResolvedValue({
        _id: castContentId,
        title: "Inception",
        cast: {
          crew: [newCastId],
        },
      });

      const updatedCastContent = {
        _id: castContentId,
        cast: {
          crew: [],
        },
      };

      jest
        .spyOn(Content.prototype, "save")
        .mockResolvedValue(updatedCastContent);

      const res = await request(app)
        .delete(`/content/${req.params.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.body).toHaveProperty("status", "success");
      expect(res.body.data.cast.crew).not.toContain(newCastId.toString());
    });

    it("Delete A Cast Info", async () => {
      const req = {
        params: { id: newCastId },
      };

      jest.spyOn(Cast, "findByIdAndDelete").mockResolvedValue({
        name: "Sharukhan",
        age: 52,
        classification: "Actor",
        content: [castContentId],
      });

      const res = await request(app)
        .delete(`/cast/${req.params.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.body).toHaveProperty("status", "success");
    });
  });
});
