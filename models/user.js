const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userName: {
      type: String,
      unique: [true, "This name was already registered...Please try again"],
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    age: {
      type: Number,
      min: 1,
    },
    phoneNumber: {
      type: String,
    },
    membership: {
      type: String,
      default: "REGULAR",
      enum: ["REGULAR", "GOLD", "PREMIUM"],
      validate: {
        validator: function (val) {
          if (this.role === "admin") {
            this.membership = undefined;
          }
          return true;
        },
      },
    },
    favorites: {
      type: [{ type: Schema.Types.ObjectId, ref: "Content" }],
      default: [],

      validate: {
        validator: function (val) {
          if (this.role === "admin") {
            this.favorites = undefined;
          }
          return true;
        },
      },
    },
  },
  { timestamps: true }
);

UserSchema.methods.addToFavorites = function (content) {
  this.favorites.push(content);
  return this.save();
};

UserSchema.methods.removeFromFavorites = function (contentId) {
  const contentIndex = this.favorites.findIndex(
    (obj) => obj._id.toString() === contentId.toString()
  );
  this.favorites.splice(contentIndex, 1);
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
