const slugify = require("slugify");
const fs = require("fs");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const braintree = require("braintree");
const dotenv = require("dotenv");

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//get all products
const getAllproducts = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Products List",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting products",
      error,
    });
  }
};

//create new product
const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is required!" });
      case !description:
        return res.status(500).send({ error: "Description is required!" });
      case !price:
        return res.status(500).send({ error: "Price is required!" });
      case !category:
        return res.status(500).send({ error: "Category is required!" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is required!" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Image is required and should be less than 1mb!" });
    }

    const products = await productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product created Successfully!",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while creating product.",
      error,
    });
  }
};

//get single product
const singleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single product Fetched.",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product!",
      error,
    });
  }
};

//update product
const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is required!" });
      case !description:
        return res.status(500).send({ error: "Description is required!" });
      case !price:
        return res.status(500).send({ error: "Price is required!" });
      case !category:
        return res.status(500).send({ error: "Category is required!" });
      case !quantity:
        return res.status(500).send({ error: "Quantity is required!" });
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ error: "Image is required and should be less than 1mb!" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product updated Successfully!",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while updating product.",
      error,
    });
  }
};

//get product photo
const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      console.log(product);
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching product image!",
      error,
    });
  }
};

//delete single product
const deleteProductController = async (req, res) => {
  try {
    const product = await productModel
      .findByIdAndDelete(req.params.pid)
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully!",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product!",
      error,
    });
  }
};

//product filters
const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

//count all products
const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while counting products",
      error,
    });
  }
};

//products list based on page
const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while per page products",
      error,
    });
  }
};

const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while searching product",
      error,
    });
  }
};

//related products
const RelatedProductsController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting similar products",
      error,
    });
  }
};

//get products by category
const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while fetching category products.",
      error,
    });
  }
};

//payment gateway API
//token
const brainTreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payments
const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllproducts,
  createProductController,
  singleProductController,
  productPhotoController,
  updateProductController,
  deleteProductController,
  productFilterController,
  productCountController,
  productListController,
  searchProductController,
  RelatedProductsController,
  productCategoryController,
  brainTreeTokenController,
  brainTreePaymentController,
};
