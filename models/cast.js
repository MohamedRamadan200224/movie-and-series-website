const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const castSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classification: {
      type: String,
      required: true,
      enum: ["Actor", "Actress", "Director"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    content: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Content",
        },
      ],
      default: [],
    },
    age: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Cast = mongoose.model("Cast", castSchema);

module.exports = Cast;
