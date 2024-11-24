const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject(new Error("E-Mail address already exists!"));
        }
        return Promise.resolve();
      }),

    body("password")
      .isAlphanumeric()
      .withMessage("Password must be alphanumeric.")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .trim(),

    body("passwordConfirm")
      .isAlphanumeric()
      .withMessage("Password confirmation must be alphanumeric.")
      .isLength({ min: 8 })
      .withMessage("Password confirmation must be at least 8 characters.")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return Promise.reject(
            new Error("Password and Password Confirm don't match!")
          );
        }
        return Promise.resolve();
      }),

    body("userName").isString().trim().withMessage("Name is required!"),
    body("gender")
      .isString()
      .trim()
      .custom((value, { req }) => {
        if (!["Male", "Female"].includes(value)) {
          return Promise.reject(new Error("It Has To Be a Male or Female"));
        }
        return Promise.resolve();
      }),
    body("age")
      .optional()
      .isNumeric()
      .withMessage("Age is Numeric!")
      .custom((value, { req }) => {
        if (value <= 0) {
          return Promise.reject(new Error("You can't be less than zero!"));
        }
        return Promise.resolve();
      }),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            let error = new Error("E-Mail address doesn't exist!");
            error.statusCode = 400;
            return next(error);
            // return Promise.reject("E-Mail address already exists!");
          }
        });
      }),

    body("password").isAlphanumeric().trim().isLength({ min: 8 }),
  ],
  authController.login
);

router
  .route("/payMembership")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    [body("membership").isString()],
    userController.createOrderAndGeneratePayment
  );

router
  .route("/checkPaymentStatus")
  .post(
    authController.protect,
    authController.restrictTo("user"),
    [body("membership").isString()],
    userController.checkPaymentStatus
  );

module.exports = router;
