const path = require("path");
const Content = require("../models/content");
const { ContentClass } = require("../models/content");
const { validationResult } = require("express-validator");
const fs = require("fs");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../public/imgs/content");
  },
  filename: (req, file, cb) => {
    cb(null, "Content" + "-" + file.originalname);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadContentImage = upload.single("imageCover");

const errFunction = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
};

// Replace 'your_api_key' with your actual Streamtape API key
// const API_KEY = "dq6hzjewe27bmwdn";

// Function to get the upload URL from Streamtape

// Function to get the upload URL from Streamtape
// async function getUploadUrl() {
//   try {
//     const response = await axios.get(
//       `https://api.streamtape.com/file/ul?login=${API_KEY}`
//     );
//     if (response.data && response.data.result && response.data.result.url) {
//       return response.data.result.url;
//     } else {
//       throw new Error("Could not retrieve upload URL.");
//     }
//   } catch (error) {
//     console.error("Error getting upload URL:", error.message);
//   }
// }

// const uploadFile = async (filePath) => {
//   try {
//     const uploadUrl = await getUploadUrl();
//     if (!uploadUrl) return;

//     const fileStream = fs.createReadStream(filePath);
//     const form = new FormData();
//     form.append("file1", fileStream);

//     const response = await axios.post(uploadUrl, form, {
//       headers: {
//         ...form.getHeaders(),
//       },
//       onUploadProgress: (progressEvent) => {
//         const percentCompleted = Math.round(
//           (progressEvent.loaded * 100) / progressEvent.total
//         );
//         console.log(`Upload Progress: ${percentCompleted}%`);
//       },
//     });

//     if (response.data && response.data.result && response.data.result.link) {
//       console.log("File uploaded successfully:", response.data.result.link);
//       return response.data.result.link;
//     } else {
//       console.log("File upload failed:", response.data);
//     }
//   } catch (error) {
//     console.error("Error uploading file:", error.message);
//   }
// };

exports.addContent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array().msg);
      error.statusCode = 422;
      throw error;
    }

    let image;

    if (req.file) {
      image = req.file.filename;
    }

    const title = req.body.title;
    const description = req.body.description;
    const category = req.body.category;
    const duration = req.body.duration;
    const parentalGuide = req.body.parentalGuide;
    const genre = req.body.genre;
    const rating = req.body.rating;
    const production = req.body.production;
    const productionImgs = `../public/imgs/${req.body.production}.png`;
    const quality = req.body.quality;

    let castCrew;

    if (req.body.castCrew) {
      castCrew = req.body.castCrew;
    }

    // const contentLink = await uploadFile(theContent);

    // if (!image) {
    //   return res.status(422).json({
    //     status: "failed",
    //     message: "Attached file is not an image!",
    //   });
    // }

    const content = new Content({
      title: title,
      imageCover: image,
      description: description,
      category: category,
      duration: duration,
      parentalGuide: parentalGuide,
      genre: genre,
      rating: rating,
      quality: quality,
      cast: req.body.castCrew !== undefined ? [...castCrew] : [],
      production: production,
      productionImgs: productionImgs,
      // contentLink: contentLink,
    });

    const result = await content.save();
    console.log("Created Content");
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    errFunction(err, next);
  }
};

exports.editContent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array().msg);
      error.statusCode = 422;
      throw error;
    }

    const result = await Content.findById(req.params.id);

    if (req.file) {
      fs.unlink(result.imageCover, (err) => {
        if (err) next(err);
      });
      req.body.imageCover = req.file.filename;
    }

    if (req.body.contentLink && req.body.episodeNum && req.body.seasonNum) {
      const contentLinkExists = result.seasons[seasonNum].episodes[
        req.body.episodeNum
      ].includes(req.body.contentLink);
      if (!contentLinkExists) {
        result.seasons[seasonNum].episodes.splice(
          req.body.episodeNum,
          1,
          req.body.contentLink
        );
        await result.save();
      }
    }

    const updatedContent = await Content.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });
    console.log("UPDATED Content! : ", updatedContent);
    res.status(200).json({
      status: "success",
      data: updatedContent._doc,
    });
    console.log("UPDATED Content!!! : ", updatedContent.title);
  } catch (err) {
    errFunction(err, next);
  }
};

exports.saveContentLink = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array().msg);
      error.statusCode = 422;
      throw error;
    }

    const result = await Content.findById(req.params.req.params.id);

    if (req.body.contentLink && req.body.episodeNum && req.body.seasonNum) {
      const contentLinkExists = result.seasons[seasonNum].episodes[
        req.body.episodeNum
      ].includes(req.body.contentLink);
      if (!contentLinkExists) {
        result.seasons[seasonNum].episodes.splice(
          req.body.episodeNum,
          1,
          req.body.contentLink
        );
        await result.save();
      }
    }

    // const result = await Content.findByIdAndUpdate(req.params.contentId, {
    //   contentLink: req.body.contentLink,
    // });

    console.log("Content Link Saved To Database!");
    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (err) {
    errFunction(err, next);
  }
};

exports.getAllContent = async (req, res, next) => {
  try {
    const page = req.query.page;
    const ITEMS_PER_PAGE = 10;
    let content;
    let filterQuery = { ...req.query };
    let filterQueryLength = Object.keys(filterQuery).length;

    let excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete filterQuery[el]);
    if (Object.keys(filterQuery).length < filterQueryLength) {
      content = await Content.aggregate([
        { $match: filterQuery },
        { $skip: (page - 1) * ITEMS_PER_PAGE },
        { $limit: ITEMS_PER_PAGE },
        { $sort: { createdAt: -1 } },
      ]);
    } else {
      content = await Content.aggregate([
        { $match: filterQuery },
        { $skip: 0 * ITEMS_PER_PAGE },
        { $limit: ITEMS_PER_PAGE },
        { $sort: { createdAt: -1 } },
      ]);
    }
    res.status(200).json({
      status: "success",
      data: content,
    });
  } catch (err) {
    errFunction(err, next);
  }
};

exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: content,
    });
  } catch (err) {
    errFunction(err, next);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    console.log("DELETED CONTENT");
    res.status(204).json({
      status: "success",
      message: "Content deleted successfully",
    });
  } catch (err) {
    errFunction(err, next);
  }
};

exports.editParentalGuide = (method) => (req, res, next) => {
  if (method === "add") {
    ContentClass.addParentalGuide(req.body.parentalGuide);
    res.send("success");
  } else if (method === "remove") {
    ContentClass.removeParentalGuide(req.body.parentalGuide);
    res.send("success");
  }
};

exports.editGenre = (method) => (req, res, next) => {
  if (method === "add") {
    ContentClass.addGenre(req.body.genre);
    res.send("success");
  } else if (method === "remove") {
    ContentClass.removeGenre(req.body.genre);
    res.send("success");
  }
};

exports.editProduction = (method) => (req, res, next) => {
  if (method === "add") {
    ContentClass.addProduction(req.body.production);
    res.send("success");
  } else if (method === "remove") {
    ContentClass.removeProduction(req.body.production);
    res.send("success");
  }
};

exports.editType = (method) => (req, res, next) => {
  if (method === "add") {
    ContentClass.addType(req.body.type);
    res.send("success");
  } else if (method === "remove") {
    ContentClass.removeType(req.body.type);
    res.send("success");
  }
};

exports.getTypes = (req, res, next) => {
  res.status(200).JSON({
    status: "success",
    types: ContentClass.types,
  });
};

exports.getParentalGuides = (req, res, next) => {
  res.status(200).JSON({
    status: "success",
    parentalGuides: ContentClass.parentalGuides,
  });
};

exports.getProductions = (req, res, next) => {
  res.status(200).JSON({
    status: "success",
    productions: ContentClass.productions,
  });
};

exports.getGenres = (req, res, next) => {
  res.status(200).JSON({
    status: "success",
    genres: ContentClass.genres,
  });
};

exports.createFavoritesPdf = (req, res, next) => {
  const PDFDocument = require("pdfkit");
  const fs = require("fs");
  User.findById(req.user._id)
    .populate("favorites")
    .exec((err, favoriteContent) => {
      if (err) {
        return next(err);
      } else {
        const doc = new PDFDocument();
        doc.pipe(
          fs.createWriteStream(
            path.join(
              __dirname,
              data,
              favorites,
              `${req.user._id}-${req.user.name}-favorites.pdf`
            )
          )
        );
        const adultPG = ["NC-17", "R", "TV-MA", "+18"];
        favoriteContent.forEach((favorite) => {
          doc
            .addPage()
            .image(favorite.imageCover, { fit: [500, 500], align: "center" })
            .moveDown(1)
            .font("Helvetica-Bold")
            .fontSize(24)
            .fillColor("black")
            .text(favorite.title, { align: "center" })
            .fontSize(16)
            .fillColor(
              adultPG.includes(favorite.parentalGuide) ? "red" : "green"
            )
            .text(favorite.parentalGuide, {
              align: "center",
              border: true,
              borderColor: "black",
              borderWidth: 1,
              margin: 5,
            })
            .moveDown(0.5)
            .fontSize(18)
            .fillColor("yellow")
            .text(`Ratings: ${favorite.rating}`, { align: "center" })
            .moveDown(0.5)
            .fontSize(16)
            .fillColor("black")
            .text("Genres:", { align: "center" });

          favorite.genres.forEach((genre) => {
            doc.fontSize(16).fillColor("black").text(genre, {
              align: "center",
              border: true,
              borderColor: "black",
              borderWidth: 1,
              margin: 5,
            });
          });

          doc
            .moveDown(0.5)
            .fontSize(14)
            .fillColor("black")
            .text(favorite.description, { align: "center" });

          // Add watermark
          doc
            .fontSize(30)
            .fillColor("gray")
            .opacity(0.5)
            .text("CineStream", 450, 50, { align: "right", rotate: 45 })
            .opacity(1); // Reset opacity for the rest of the content
        });

        doc.end();
      }
    });

  // Sample favorites array
  // const favorites = [
  //   {
  //     imageCover: "path/to/image1.jpg",
  //     name: "Favorite Item 1",
  //     ratings: 4.5,
  //     genres: ["Genre1", "Genre2"],
  //     description: "This is a description of favorite item 1.",
  //     url: "https://yourwebsite.com/content1",
  //   },
  //   {
  //     imageCover: "path/to/image2.jpg",
  //     name: "Favorite Item 2",
  //     ratings: 4.7,
  //     genres: ["Genre3", "Genre4"],
  //     description: "This is a description of favorite item 2.",
  //     url: "https://yourwebsite.com/content2",
  //   },
  //   // Add more items as needed
  // ];
};
