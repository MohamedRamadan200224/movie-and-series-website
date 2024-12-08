const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const yup = require("yup");
const User = require("../models/user");
const Post = require("../models/post");
const Content = require("../models/content");
const ContentClass = require("../models/ContentClass");

const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");

// Token signing function
const signToken = (id) => {
  return jwt.sign({ id }, "theMostUnknownSecretKey", {
    expiresIn: "1h",
  });
};

// Create and send JWT token
const createSendToken = (user) => {
  const token = signToken(user._id);
  user.password = undefined; // Hide password in output
  return {
    token,
    user,
  };
};

function sameCast(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  let sortedArr1 = arr1
    .slice()
    .sort((a, b) => a.castId.toString().localeCompare(b.castId.toString()));
  let sortedArr2 = arr2
    .slice()
    .sort((a, b) => a.castId.toString().localeCompare(b.castId.toString()));

  return sortedArr1.every(
    (obj, index) =>
      obj.castId.toString() === sortedArr2[index].castId.toString()
  );
}

const errFunction = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
};
const schema = yup.object().shape({
  title: yup.string().trim().min(1).required().uppercase(),
  image: req.file,
  description: req.body.description
    .string()
    .trim()
    .min(1)
    .required()
    .lowercase(),
  category: req.body.category.string(),
  duration: req.body.duration
    .number()
    .moreThan(10, "Content time is too short!")
    .positive("Content time can't be negative!"),
  parentalGuide: req.body.parentalGuide.string().trim().min(1).required(),
  genre: req.body.genre.array().required(),
  rating: req.body.rating.number().min(0).max(10),
  quality: req.body.quality.string().required(),
  castCrew: req.body.castCrew.array(),
  production: req.body.production.required().string(),
  productionImgs: `../public/imgs/${req.body.production}`,
});

module.exports = {
  getTypes: () => {
    return ContentClass.types();
  },
  getGenres: () => {
    return ContentClass.genres();
  },
  getProductions: () => {
    return ContentClass.productions();
  },
  getParentalGuides: () => {
    return ContentClass.parentalGuides();
  },

  addContent: async function ({ ...args }, req) {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   const error = new Error(errors.array().msg);
      //   error.statusCode = 422;
      //   throw error;
      // }

      const contentObj = {
        title: req.body.title,
        image: req.file,
        description: req.body.description,
        category: req.body.category,
        duration: req.body.duration,
        parentalGuide: req.body.parentalGuide,
        genre: req.body.genre,
        rating: req.body.rating,
        quality: req.body.quality,
        castCrew: req.body.castCrew,
        production: req.body.production,
        productionImgs: `../public/imgs/${req.body.production}`,
      };

      await schema.validate(contentObj);

      if (!contentObj.image) {
        return res.status(422).json({
          status: "failed",
          message: "Attached file is not an image!",
        });
      }

      const imageUrl = contentObj.image.path;

      const content = new Content({
        title: title,
        imageCover: imageUrl,
        price: price,
        description: description,
        category: category,
        duration: duration,
        parentalGuide: parentalGuide,
        genre: genre,
        rating: rating,
        quality: quality,
        cast: {
          crew: castCrew,
        },
        production: production,
        productionImgs: productionImgs,
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
  },

  editContent: async function (req, res, next) {
    try {
      let content = {
        title: req.body.title,
        duration: req.body.duration,
        rating: req.body.rating,
        genre: req.body.genre,
        description: req.body.description,
        production: req.body.production,
        category: req.body.category,
        quality: req.body.quality,
      };

      if (!req.file) {
        content["imageCover"] = req.body.imageCover;
      } else if (req.file) {
        content["imageCover"] = req.file.imageCover;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error(errors.array().msg);
        error.statusCode = 422;
        throw error;
      }

      const result = await Content.findById(req.params.contentId);
      if (!sameCast(result.cast.crew, req.body.crew)) {
        content["cast.crew"] = req.body.cast;
      }
      if (req.file.path !== result.imageCover) {
        fs.unlink(result.imageCover, (err) => {
          if (err) next(err);
        });
      }

      const updatedContent = await Content.findByIdAndUpdate(
        { _id: req.params.contentId },
        content
      );
      console.log("UPDATED Content!");
      res.status(200).json({
        status: "success",
        data: updatedContent,
      });
    } catch (err) {
      errFunction(err, next);
    }
  },

  getAllContent: async function (req, res, next) {
    try {
      const page = req.query.page;
      const ITEMS_PER_PAGE = 10;
      const content = await Content.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);

      res.status(200).json({
        status: "success",
        data: content,
      });
    } catch (err) {
      errFunction(err, next);
    }
  },

  getContent: async function (req, res, next) {
    try {
      const content = await Content.findById(req.params.id);
      res.status(200).json({
        status: "success",
        data: content,
      });
    } catch (err) {
      errFunction(err, next);
    }
  },

  deleteContent: async function (req, res, next) {
    try {
      const contentId = req.body.contentId;
      await Content.findByIdAndDelete(contentId);
      console.log("DELETED CONTENT");
      res.status(204).json({
        status: "success",
        message: "Content deleted successfully",
      });
    } catch (err) {
      errFunction(err, next);
    }
  },
  // Queries
  getUser: async ({ _id }, req) => {
    // Protect resolver with authorization check
    if (!req.user) {
      throw new Error("Not authenticated!");
    }
    return await User.findById(_id);
  },

  // Mutations
  signup: async ({ user }) => {
    const newUser = await User.create({
      name: user.name,
      email: user.email,
      password: user.password,
      passwordConfirm: user.passwordConfirm,
      role: user.role,
    });
    return createSendToken(newUser);
  },

  login: async ({ user }) => {
    const { email, password } = user;

    // 1) Check if email and password exist
    if (!email || !password) {
      throw new Error("Please provide email and password!");
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error("Incorrect email or password!");
    }

    // 3) If everything ok, send token to client
    return createSendToken(user);
  },

  // Authorization Helpers
  protect: async (req) => {
    let token;
    if (req.get("Authorization")) {
      token = req.get("Authorization").split(" ")[1];
    }

    if (!token) {
      throw new Error("Not authorized for access!");
    }

    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, "theMostUnknownSecretKey");
    } catch (err) {
      throw new Error("Invalid token. Please log in again!");
    }

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error("The user belonging to this token no longer exists!");
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new Error("User recently changed password! Please log in again!");
    }

    // Attach user to request
    req.user = currentUser;
    return req;
  },

  restrictTo: (...roles) => {
    return (req) => {
      if (!roles.includes(req.user.role)) {
        throw new Error("You do not have permission to perform this action!");
      }
    };
  },
};

// module.exports = {
//   createUser: async function ({ userInput }, req) {
//     //   const email = args.userInput.email;
//     const errors = [];
//     if (!validator.isEmail(userInput.email)) {
//       errors.push({ message: "E-Mail is invalid." });
//     }
//     if (
//       validator.isEmpty(userInput.password) ||
//       !validator.isLength(userInput.password, { min: 5 })
//     ) {
//       errors.push({ message: "Password too short!" });
//     }
//     if (errors.length > 0) {
//       const error = new Error("Invalid input.");
//       error.data = errors;
//       error.code = 422;
//       throw error;
//     }
//     const existingUser = await User.findOne({ email: userInput.email });
//     if (existingUser) {
//       const error = new Error("User exists already!");
//       throw error;
//     }
//     const hashedPw = await bcrypt.hash(userInput.password, 12);
//     const user = new User({
//       email: userInput.email,
//       name: userInput.name,
//       password: hashedPw,
//     });
//     const createdUser = await user.save();
//     return { ...createdUser._doc, _id: createdUser._id.toString() };
//   },
//   login: async function ({ email, password }) {
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       const error = new Error("User not found.");
//       error.code = 401;
//       throw error;
//     }
//     const isEqual = await bcrypt.compare(password, user.password);
//     if (!isEqual) {
//       const error = new Error("Password is incorrect.");
//       error.code = 401;
//       throw error;
//     }
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//       },
//       "somesupersecretsecret",
//       { expiresIn: "1h" }
//     );
//     return { token: token, userId: user._id.toString() };
//   },
//   createPost: async function ({ postInput }, req) {
//     if (!req.isAuth) {
//       const error = new Error("Not authenticated!");
//       error.code = 401;
//       throw error;
//     }
//     const errors = [];
//     if (
//       validator.isEmpty(postInput.title) ||
//       !validator.isLength(postInput.title, { min: 5 })
//     ) {
//       errors.push({ message: "Title is invalid." });
//     }
//     if (
//       validator.isEmpty(postInput.content) ||
//       !validator.isLength(postInput.content, { min: 5 })
//     ) {
//       errors.push({ message: "Content is invalid." });
//     }
//     if (errors.length > 0) {
//       const error = new Error("Invalid input.");
//       error.data = errors;
//       error.code = 422;
//       throw error;
//     }
//     const user = await User.findById(req.userId);
//     if (!user) {
//       const error = new Error("Invalid user.");
//       error.code = 401;
//       throw error;
//     }
//     const post = new Post({
//       title: postInput.title,
//       content: postInput.content,
//       imageUrl: postInput.imageUrl,
//       creator: user,
//     });
//     const createdPost = await post.save();
//     user.posts.push(createdPost);
//     await user.save();
//     return {
//       ...createdPost._doc,
//       _id: createdPost._id.toString(),
//       createdAt: createdPost.createdAt.toISOString(),
//       updatedAt: createdPost.updatedAt.toISOString(),
//     };
//   },
//   posts: async function ({ page }, req) {
//     if (!req.isAuth) {
//       const error = new Error("Not authenticated!");
//       error.code = 401;
//       throw error;
//     }
//     if (!page) {
//       page = 1;
//     }
//     const perPage = 2;
//     const totalPosts = await Post.find().countDocuments();
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .populate("creator");
//     return {
//       posts: posts.map((p) => {
//         return {
//           ...p._doc,
//           _id: p._id.toString(),
//           createdAt: p.createdAt.toISOString(),
//           updatedAt: p.updatedAt.toISOString(),
//         };
//       }),
//       totalPosts: totalPosts,
//     };
//   },
// };
