const express = require("express");

const contentController = require("../controllers/content");

const authController = require("../controllers/auth");
const { body } = require("express-validator");

const router = express.Router();

router
  .route("/")
  .get(contentController.getAllContent)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    [
      body("title").trim().isLength({ min: 1 }),
      body("duration").isNumeric(),
      body("parentalGuide")
        .isString()
        .trim()
        .isLength({ min: 1 })
        .toUpperCase(),
      body("genre").isArray(),
      body("production").isString().trim().isLength({ min: 2 }).toUpperCase(),
      body("rating").isNumeric(),
      body("quality").isString().trim().isLength({ min: 3 }).toUpperCase(),
      body("description").isString().trim(),
      body("category").isString().trim(),
    ],
    contentController.uploadContentImage,
    contentController.addContent
  );

router
  .route("/:id")
  .get(contentController.getContent)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    [
      body("title").optional().isString().trim().isLength({ min: 1 }),
      body("imageCover").optional().isString().trim(),
      body("duration").optional().isNumeric(),
      body("parentalGuide")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .toUpperCase(),
      body("genre").optional().isArray(),
      body("production")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .toUpperCase(),
      body("rating").optional().isNumeric(),
      body("quality")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 1 })
        .toUpperCase(),
      body("contentLink").optional(),
      // .trim().isURL(),
    ],
    contentController.uploadContentImage,
    contentController.editContent
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    contentController.deleteContent
  );

router
  .route("/saveContentLink/:contentId")
  .patch(
    authController.restrictTo("admin"),
    [body("contentLink").trim().isURL()],
    contentController.saveContentLink
  );

router
  .patch(
    "/editContentOptions/addTypes",
    body("category").isString().trim().isLength({ min: 4 }),
    contentController.editType("add")
  )
  .patch(
    "/editContentOptions/removeTypes",
    contentController.editType("remove")
  )
  .patch(
    "/editContentOptions/addGenres",
    body("genre").isArray(),
    contentController.editGenre("add")
  )
  .patch(
    "/editContentOptions/removeGenres",
    contentController.editGenre("remove")
  )
  .patch(
    "/editContentOptions/addParentalGuide",
    body("parentalGuide").isString().trim().isLength({ min: 1 }).isUppercase(),
    contentController.editParentalGuide("add")
  )
  .patch(
    "/editContentOptions/removeParentalGuide",
    contentController.editParentalGuide("remove")
  )
  .patch(
    "/editContentOptions/addProduction",
    body("production").isString().trim().isLength({ min: 1 }).isUppercase(),
    contentController.editProduction("add")
  )
  .patch(
    "/editContentOptions/removeProduction",
    contentController.editProduction("remove")
  );

module.exports = router;
