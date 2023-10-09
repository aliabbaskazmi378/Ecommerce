const { default: slugify } = require("slugify");
const categoryModel = require("../models/categoryModel");

//create category
const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(401).send({
        message: "Name is required!",
      });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category already Exists!",
      });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res.status(200).send({
      success: true,
      message: "Category created Successfully!",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Category",
      error,
    });
  }
};

//update category
const updateCategoryController = async (req, res) => {
  try {
    const {name} = req.body;
    const {id} = req.params;
    const category = await categoryModel.findByIdAndUpdate(id, {name, slug: slugify(name)}, {new: true})
    res.status(200).send({
        success: true,
        message: 'Category updated successfully!',
        category
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating Category!",
      error,
    });
  }
};

//get all categories
const categoryController = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        res.status(200).send({
            success: true,
            message: 'All Categories List',
            category
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
        success: false,
        message: "Error while getting All Categories!",
        error,
        });
    }
}

//get single category by slug
const singleCategoryController = async (req, res) => {
    try {
        const {slug} = req.params;
        const category = await categoryModel.findOne({slug})
        res.status(200).send({
            success: true,
            message: 'Get single category successfully!',
            category
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting single category",
            error
        })
    }
}

//delete category by slug
const deleteCategoryController = async (req, res) => {
    try {
        const {id} = req.params; 
        const category = await categoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Category deleted successfully!"
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Error while deleting category!',
            error
        })
    }
}

module.exports = {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController
};
