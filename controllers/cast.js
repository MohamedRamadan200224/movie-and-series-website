const Cast = require("../models/cast");
const Content = require("../models/content");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/imgs/cast");
  },
  filename: (req, file, cb) => {
    cb(null, "CastMember" + "-" + file.originalname);
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

exports.uploadCastMemberImage = upload.single("imageUrl");
// exports.resizeImgs = (modelName) =>
//   catchAsync(async (req, res, next) => {
//     if (!req.files) return next();
//     const date = new Date();
//     //uploading image cover
//     if (req.files.imageCover) {
//       req.body.imageCover = `${req.user.name.split(' ', 1)[0]}-${
//         req.body.category
//       }-${req.user.id}-${Date.now()}-cover.jpeg`;

//       await sharp(req.files.imageCover[0].buffer)
//         .resize(2000, 1333)
//         .toFormat('jpeg')
//         .jpeg({ quality: 90 })
//         .toFile(`public/img/${req.body.category}/${req.body.imageCover}`);
//     }

//     //uploadimg images
//     req.body.images = [];

//     if (req.files.images) {
//       await Promise.all(
//         req.files.images.map(async (file, i) => {
//           const filename = `${req.user.name}-${modelName}-${
//             req.params.id
//           }-${Date.now()}-${i + 1}.jpeg`;

//           await sharp(req.files.images[i].buffer)
//             .resize(2000, 1333)
//             .toFormat('jpeg')
//             .jpeg({ quality: 90 })
//             .toFile(
//               `public/img/${req.body.category.toLowerCase()}/${filename}`
//             );

//           req.body.images.push(filename);
//         })
//       );
//     }
//     next();
//   });

exports.addCast = async (req, res, next) => {
  const name = req.body.name;
  const age = req.body.age;
  const classification = req.body.classification;
  const content = req.body.content;
  let imageUrl;
  if (req.file) {
    imageUrl = req.file.filename;
  }

  const newCast = await Cast.create({
    name: name,
    imageUrl: imageUrl,
    age: age,
    classification: classification,
    content: content,
  });
  if (req.params.contentIdPage) {
    const content = await Content.findById(req.params.contentIdPage);
    content.cast.push(newCast);
    await content.save();
    newCast.content.push(content);
    await newCast.save();
  }

  // if (req.params.contentId) {
  //   let content = await Content.findById(req.params.contentId);
  //   content.cast.crew.push(newCast._id);
  //   content
  //     .save()
  //     .then((result) => {
  //       console.log("Created Content");
  //       res.status(200).JSON({
  //         status: "success",
  //         data: result,
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       res.status(400).JSON({
  //         status: "error",
  //         message: err.message,
  //       });
  //     });
  // } else {
  res.status(200).json({
    status: "success",
    data: newCast,
  });
};

// exports.editCast = async (req, res, next) => {
//   const updatedCastContent = await Content.findByIdAndUpdate(
//     { _id: req.params.contentId },
//     { "cast.crew": req.body.cast }
//   );

//   res.status(200).JSON({
//     status: "success",
//     data: updatedCastContent,
//   });
// };

exports.editCastMember = async (req, res, next) => {
  // const prodId = req.body.productId;
  // const updatedTitle = req.body.title;
  // const updatedPrice = req.body.price;
  // const updatedImageUrl = req.body.imageUrl;
  // const updatedDesc = req.body.description;
  if (req.file) {
    req.body.imageUrl = req.file.filename;
  }

  const updatedCastMember = await Cast.findByIdAndUpdate(
    { _id: req.params.castMemberId },
    req.body
  );

  res.status(200).json({
    status: "success",
    data: updatedCastMember,
  });
};

exports.getAllCast = async (req, res, next) => {
  const page = req.query.page;
  const ITEMS_PER_PAGE = 10;

  let cast;
  if (req.query.page) {
    cast = await Cast.aggregate([
      { $match: { content: req.params.contentIdPage } },
      { $skip: (page - 1) * ITEMS_PER_PAGE },
      { $limit: ITEMS_PER_PAGE },
      { $sort: { name: 1 } },
    ]);
  } else {
    cast = await Cast.aggregate([
      { $match: { content: req.params.contentIdPage } },
      { $skip: 0 * ITEMS_PER_PAGE },
      { $limit: ITEMS_PER_PAGE },
      { $sort: { name: 1 } },
    ]);
  }

  res.status(200).json({
    status: "success",
    data: cast,
  });
};

exports.getCastMember = async (req, res, next) => {
  const castMember = await Cast.findById(req.params.castMemberId);

  // if (!castMember) {
  //   req.flash("contentNotFoundError", "Content Not Found!");
  // }
  res.status(200).JSON({
    status: "success",
    data: castMember,
  });
};

exports.deleteCast = async (req, res, next) => {
  const deletedCast = await Cast.findByIdAndDelete({
    _id: req.params.castMemberId,
  });

  res.status(204).JSON({
    status: "success",
    data: deletedCast,
  });
};

exports.removeCastMember = async (req, res, next) => {
  const content = await Content.findById(req.body.contentId);

  const castMember = await Cast.find({ name: req.body.name });

  content.cast.crew.pull(castMember._id);

  const updatedContent = await content.save();

  result.status(200).JSON({
    status: "success",
    data: updatedContent,
  });
};
exports.addCastMember = async (req, res, next) => {
  const content = await Content.findById(req.body.contentId);

  const castMember = await Cast.find({ name: req.body.name });

  content.cast.crew.push(castMember._id);

  const updatedContent = await content.save();

  result.status(200).JSON({
    status: "success",
    data: updatedContent,
  });
};
