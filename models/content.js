const mongoose = require("mongoose");
const Schema = mongoose.Schema;

class ContentClass {
  static type = ["Movie", "Series"];
  static parentalGuide = [
    "TV-MA",
    "+18",
    "PG-13",
    "TV-14",
    "PG",
    "TV-PG",
    "TV-G",
    "R",
    "NC-17",
  ];
  static genre = [
    "Crime",
    "War",
    "Police",
    "History",
    "Romance",
    "Comedy",
    "Thriller",
    "Action",
    "Investigation",
    "Drama",
    "Horror",
    "Documentary",
    "Talk Show",
    "SuperHero",
    "Adventure",
  ];

  static production = [
    "MARVEL",
    "DC",
    "PARAMOUNT",
    "FOX",
    "DISNEY",
    "PIXAR",
    "WARNER_BROTHERS",
    "DREAMWORKS",
    "UNIVERSAL",
    "APPLE_TV",
    "HBO",
    "NETFLIX",
    "SHAHID",
    "AMAZON_PRIME_VIDEO",
    "HULU",
    "SHOWTIME",
    "PEACOCK",
  ];

  static productionImgs = [
    "../public/imgs/MARVEL.png",
    "../public/imgs/DC.png",
    "../public/imgs/PARAMOUNT.png",
    "../public/imgs/FOX.jpg",
    "../public/imgs/DISNEY.jpg",
    "../public/imgs/PIXAR.png",
    "../public/imgs/WARNER_BROTHERS.png",
    "../public/imgs/DREAMWORKS.png",
    "../public/imgs/UNIVERSAL.webp",
    "../public/imgs/APPLE_TV.jpg",
    "../public/imgs/HBO.jpg",
    "../public/imgs/NETFLIX.jpg",
    "../public/imgs/PARAMOUNT.png",
    "../public/imgs/AMAZON_PRIME_VIDEO.jpeg",
    "../public/imgs/HULU.png",
    "../public/imgs/SHOWTIME.jpg",
    "../public/imgs/PEACOCK.png",
  ];

  static types() {
    return this.type;
  }
  static genres() {
    return this.genre;
  }
  static productions() {
    return this.production;
  }
  static parentalGuides() {
    return this.parentalGuide;
  }

  static addType(newType) {
    this.type.push(newType);
  }
  static addGenre(newGenre) {
    this.genre.push(newGenre);
  }
  static addProduction(newProduction) {
    this.production.push(newProduction);
  }
  static addParentalGuide(newParentalGuide) {
    this.parentalGuide.push(newParentalGuide);
  }
  static removeType(newType) {
    this.type.splice(this.type.indexOf(newType), 1);
  }
  static removeGenre(newGenre) {
    this.genre.splice(this.genre.indexOf(newGenre), 1);
  }
  static removeProduction(newProduction) {
    this.production.splice(this.production.indexOf(newProduction), 1);
  }
  static removeParentalGuide(newParentalGuide) {
    this.parentalGuide.splice(this.parentalGuide.indexOf(newParentalGuide), 1);
  }
}

const contentSchema = new Schema(
  {
    category: {
      type: String,
      required: [true],
      trim: true,
      enum: ContentClass.type,
    },
    title: {
      type: String,
      required: [true],
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true],
      min: 0,
    },
    parentalGuide: {
      type: String,
      required: [true],
      trim: true,
      enum: ContentClass.parentalGuide,
    },
    genre: {
      type: [String],
      required: [true],
      enum: ContentClass.genre,
    },
    production: {
      type: String,
      required: [true],
      trim: true,
      enum: ContentClass.production,
    },
    rating: {
      type: Number,
      required: [true],
    },
    productionImgs: {
      type: String,
      trim: true,
      enum: ContentClass.productionImgs,
    },
    quality: {
      type: String,
      required: [true],
      trim: true,
      enum: ["HD-TS", "HD-TC", "WEB-DL", "BLURAY", "CAM", "HDCAM"],
    },
    cast: {
      type: [{ type: Schema.Types.ObjectId, ref: "Cast" }],
      trim: true,
    },
    seasons: {
      type: [
        {
          episodes: {
            type: [String],
            default: "",
          },
        },
      ],
    },
    description: {
      type: String,
      required: [true],
      trim: true,
    },
  },
  { timestamps: true },
  {
    validate: {
      validator: function () {
        if (this.category === "Movie") {
          this.seasons = undefined;
        }
        return true;
      },
    },
  }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = ContentClass;
module.exports = Content;
