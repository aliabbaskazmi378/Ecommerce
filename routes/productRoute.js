const express = require('express');
const { getAllproducts, 
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
    brainTreePaymentController} = require('../controllers/productController');
const formidableMiddleware = require('express-formidable');
const { requireSignIn, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();


//get all products
router.get('/', getAllproducts);

//create product
router.post('/create-product', requireSignIn, isAdmin, formidableMiddleware(), createProductController);

//get single product
router.get('/get-product/:slug', singleProductController);

//get product image
router.get('/product-photo/:pid', productPhotoController);

//update product
router.patch('/update-product/:pid', requireSignIn, isAdmin, formidableMiddleware(), updateProductController);

//delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, formidableMiddleware(), deleteProductController);

//filter product
router.post('/product-filters', productFilterController);

//products count
router.get('/products-count', productCountController);

//products per page
router.get('/products-list/:page', productListController);

//search product
router.get('/search/:keyword', searchProductController);

//similar products
router.get('/related-product/:pid/:cid', RelatedProductsController);

//category wise products
router.get('/product-category/:slug', productCategoryController);

//payments routes
//token
router.get('/braintree/token', brainTreeTokenController);

//payments
router.post('/braintree/payment', requireSignIn, brainTreePaymentController)

module.exports = router;