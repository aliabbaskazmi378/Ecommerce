const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController,
} = require("../controllers/categoryController.js");

const router = express.Router();

//routes

//create category
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//update category
router.patch(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//get all categories
router.get("/", categoryController);

//get single category
router.get("/single-category/:slug", singleCategoryController);

//delete single route
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

module.exports = router;
