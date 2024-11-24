const express = require("express");

const castController = require("../controllers/cast");

const authController = require("../controllers/auth");
const { body } = require("express-validator");

const router = express.Router();

router
  .route("/:contentIdPage?")
  .get(castController.getAllCast)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    [
      body("name").trim().isLength({ min: 1 }),
      body("imageUrl").isString().trim(),
      body("age").isNumeric(),
      body("classification")
        .isString()
        .trim()
        .custom((val, { req }) => {
          return ["Actor", "Actress", "Director"].includes(val);
        }),
      body("content").optional().isArray(),
    ],
    castController.uploadCastMemberImage,
    castController.addCast
  );

// router.route("/:contentId");
// .patch(
//   authController.restrictTo("admin"),
//   body("cast").isArray(),
//   castController.editCast
// );

router
  .route("/castMember/:castMemberId")
  .get(castController.getCastMember)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    castController.uploadCastMemberImage,
    castController.editCastMember
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    castController.deleteCast
  );
// .delete(authController.restrictTo("admin"), castController.removeCastMember);

module.exports = router;
