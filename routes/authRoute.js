const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} = require("../controllers/authController.js");

//router object
const router = express.Router();

//routing

//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//FORGOT PASSWORD || METHOD POST
router.post("/forgot-password", forgotPasswordController);

//protected route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.patch('/profile', requireSignIn, updateProfileController);

//orders
router.get('/orders', requireSignIn, getOrdersController);

//all orders
router.get('/all-orders', requireSignIn, isAdmin, getAllOrdersController);

//order status
router.patch('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

module.exports = router;

