const Content = require("../models/content");
const User = require("../models/user");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const geoip = require("geoip-lite");
const currencyCodes = require("currency-codes");

function getCurrencyByIP(ip) {
  const geo = geoip.lookup(ip);

  if (!geo || !geo.country) {
    return "EGP";
  }

  // Find currency based on country code
  const currencyData = currencyCodes.country(geo.country);
  if (currencyData && currencyData.length > 0) {
    return currencyData[0].code;
  }

  return "EGP";
}

const getPayMobAuthToken = async () => {
  try {
    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/auth/tokens",
      {
        api_key: process.env.PAYMOB_API_KEY,
      }
    );
    console.log(response.data.token);
    return response.data.token;
  } catch (error) {
    console.error("Error getting paymob auth token :" + error.message);
  }
};

let orderId;
let userPaymobInfo;

// tommorrow get the package to get ip address and the location and currency details to send it
exports.createOrderAndGeneratePayment = async (req, res, next) => {
  try {
    userPaymobInfo = await getPayMobAuthToken();
    const billingData = {
      // Paymob requires this, but you can use default values if shipping is not applicable
      apartment: "NA",
      email: req.user.email,
      floor: "NA",
      first_name: req.user.userName.split(" ")[0],
      last_name: req.user.userName.split(" ")[1],
      street: "NA",
      building: "NA",
      phone_number: req.user.phoneNumber || "+201000000000",
      postal_code: "12345",
      city: "NA",
      country: "NA",
      state: "NA",
    };
    const orderData = {
      merchant_order_id: uuidv4(), // Unique ID for your order (replace with a unique value for each order)
      amount_cents:
        req.body.memberShip === "GOLD"
          ? 10000
          : req.body.memberShip === "PREMIUM"
          ? 20000
          : 10000, // Total amount in cents (e.g., 10000 cents = 100 EGP)
      currency: getCurrencyByIP(req.ip), // Currency code, for Egypt use EGP
      shipping_data: billingData,
    };
    const orderResponse = await axios.post(
      "https://accept.paymobsolutions.com/api/ecommerce/orders",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${userPaymobInfo}`,
        },
      }
    );
    orderId = orderResponse.data.id; // Order ID

    const response = await axios.post(
      "https://accept.paymobsolutions.com/api/acceptance/payment_keys",
      {
        auth_token: userPaymobInfo,
        amount_cents: orderData.amount_cents,
        expiration: 360000,
        order_id: orderId,
        billing_data: billingData,
        currency: orderData.currency,
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
        redirect_url: "https://www.npmjs.com/package/currency-codes", // Success URL
        // Optional: Include an error URL if needed
        error_url: "https://ipapi.co/developers/",
      },
      {
        headers: {
          Authorization: `Bearer ${userPaymobInfo}`,
        },
      }
    );
    process.env.PAYMOB_PAYMENT_KEY = response.data.token;

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/881265?payment_token=${process.env.PAYMOB_PAYMENT_KEY}`;
    console.log(iframeUrl);
    res.status(200).json({
      status: "success",
      url: iframeUrl,
    });
  } catch (error) {
    console.error("Error creating order or getting payment:" + error.message);
  }
};

exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const response = await axios.get(
      `https://accept.paymobsolutions.com/api/ecommerce/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${userPaymobInfo}`,
        },
      }
    );

    const order = response.data;
    const isPaymentSuccessful = order.paid_amount_cents === order.amount_cents;

    if (isPaymentSuccessful) {
      console.log("Payment was successful!");
      const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { membership: req.body.membership }
      );
      res.status(200).json({
        status: "success",
        message: `Your Membership Is Upgraded To ${req.body.membership} Successfully`,
        membership: user.membership,
      });
    } else if (order.is_canceled) {
      console.log("Payment was canceled or hasn't been completed.");
      res.status(200).json({
        status: "success",
        message:
          "Your payment has been canceled. If this was a mistake, you can retry the payment.",
      });
    } else if (order.paid_amount_cents === 0 && !order.is_canceled) {
      console.log("Payment failed.");
      res.status(402).json({
        status: "failed",
        message:
          "Your payment failed. Please try again or use a different payment method.",
      });
    } else if (order.is_payment_locked) {
      console.log("Payment is in progress or locked.");
      res.status(202).json({
        status: "pending",
        message:
          "Your payment is currently being processed. Please wait a moment and check back later.",
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error.message);
  }
};

// exports.updateMembership = (req, res, next) => {
//   const contentId = req.body.contentId;
//   Content.findById(contentId).then((content) => {
//     req.user.addToFavorites(content);
//     res.status(200).JSON({
//       status: "success",
//     });
//   });
// };

exports.addFavorite = (req, res, next) => {
  const contentId = req.body.contentId;
  Content.findById(contentId).then((content) => {
    req.user.addToFavorites(content);
    res.status(200).JSON({
      status: "success",
    });
  });
};

exports.removeFavorite = (req, res, next) => {
  const contentId = req.body.contentId;

  req.user.removeFromFavorites(contentId);
  res.status(200).JSON({
    status: "success",
  });
};

exports.AddUser = (req, res, next) => {
  // const title = req.body.title;
  // const imageUrl = req.body.imageUrl;
  // const price = req.body.price;
  // const description = req.body.description;
  const user = new User(req.body);
  user
    .save()
    .then((result) => {
      console.log("Created User");
      res.status(200).JSON({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).JSON({
        status: "error",
        message: err.message,
      });
    });
};

exports.editUser = (req, res, next) => {
  // const prodId = req.body.productId;
  // const updatedTitle = req.body.title;
  // const updatedPrice = req.body.price;
  // const updatedImageUrl = req.body.imageUrl;
  // const updatedDesc = req.body.description;

  User.findByIdAndUpdate({ _id: req.body.id }, req.body)
    .then((result) => {
      console.log("UPDATED User!");
      result.status(200).JSON({
        status: "success",
        data: result,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAllUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).JSON({
        status: "success",
        data: users,
      });
    })
    .catch((err) => console.log(err));
};

exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      res.status(200).JSON({
        status: "success",
        data: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.DeleteUser = (req, res, next) => {
  const userId = req.body.userId;
  User.findByIdAndDelete(userId)
    .then(() => {
      console.log("DELETED User");
      res.status(204).JSON({
        status: "success",
        message: "User deleted successfully",
      });
    })
    .catch((err) => console.log(err));
};
