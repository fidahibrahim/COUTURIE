const express = require("express");
const adminRoute = express();

const adminController = require("../controller/adminController");
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const orderController = require('../controller/orderController');
const adminAuth=require('../middleware/adminAuth')
const multer = require('../middleware/multer');

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.get('/', adminAuth.isLogout,adminController.adminLogin);
adminRoute.post('/', adminController.verifyLogin);

adminRoute.get('/adminDashboard', adminAuth.isLogin,adminController.loadDashboard);

adminRoute.get('/users',adminAuth.isLogin, adminController.loadUsers);
adminRoute.post('/users/:action/:id', adminController.userStatus);

adminRoute.get('/Category',adminAuth.isLogin, categoryController.loadCategory);
adminRoute.post('/category/:action/:id', categoryController.categoryStatus);
adminRoute.get('/addCategory',adminAuth.isLogin, categoryController.loadAddCatogery);
adminRoute.post('/addCategory', categoryController.addCategory);
adminRoute.get('/editCategory',adminAuth.isLogin, categoryController.loadEditCategory);
adminRoute.post('/editCategory', categoryController.editCategory);

adminRoute.get('/product',adminAuth.isLogin, productController.loadProduct);
adminRoute.get('/addProduct',adminAuth.isLogin, productController.loadAddProduct);
adminRoute.post('/addProduct', multer.upload.array("images"), productController.addProduct);
adminRoute.post('/product/:action/:id', productController.productStatus);
adminRoute.get('/editProduct',adminAuth.isLogin, productController.loadeditProduct)
adminRoute.post('/editProduct', multer.upload.array("images"), productController.editProduct)
adminRoute.patch("/product/deleteImage",  productController.deleteImg);

adminRoute.get('/orders',adminAuth.isLogin,orderController.loadAdminOrders)
adminRoute.get('/logout',adminAuth.isLogin,adminController.logout);


module.exports = adminRoute;