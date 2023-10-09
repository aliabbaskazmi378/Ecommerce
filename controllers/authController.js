const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const authHelper = require("../helpers/authHelper");
var jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    const { name, email, password, mobile, address, answer } = req.body;

    if (!name) {
      return res.send({ message: "Name is required" });
    }
    if (!email) {
      return res.send({ message: "Email is required" });
    }
    if (!password) {
      return res.send({ message: "Password is required" });
    }
    if (!mobile) {
      return res.send({ message: "Mobile no is required" });
    }
    if (!address) {
      return res.send({ message: "Address is required" });
    }
    if (!answer) {
      return res.send({ message: "Answer is required" });
    }

    //check user
    const existingUser = await userModel.findOne({ email });

    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }

    //register user
    const hashedPassword = await authHelper.hashPassword(password);

    //save password
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Registered Successfully!",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

//POST login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      res.status(404).send({
        message: false,
        message: "Invalid email or Password",
      });
    }
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const match = await authHelper.comparePassword(password, user.password);
    if (!match) {
      return res.status(404).send({
        success: false,
        message: "Invalid Password",
      });
    }

    //token
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login Successfully!",
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//forgotPasswordController

const forgotPasswordController = async (req, res) => {
  try {
    // const [email, answer, newPassword] = req.body;
    const email = req.body.email;
    const answer = req.body.answer;
    const newPassword = req.body.newPassword;
    if (!email) {
      res.status(400).send({ message: "Email is required!" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required!" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required!" });
    }

    //check password
    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }
    const hashed = await authHelper.hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

//update profile
const updateProfileController = async (req, res) => {
  try {
    const { name, mobile, email, address, password } = req.body;
    const user = await userModel.findById(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 5 character length" });
    }
    const hashedPassword = password
      ? await authHelper.hashPassword(password)
      : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        address: address || user.address,
        password: hashedPassword || user.password,
        mobile: mobile || user.mobile,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile updated Successfully!",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user profile.",
      error,
    });
  }
};

//get user orders
const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user profile.",
      error,
    });
  }
};

//get all orders
const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user profile.",
      error,
    });
  }
};

const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating user profile.",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
};
