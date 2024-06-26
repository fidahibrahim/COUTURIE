const express = require("express");
const adminRoute = express();
const adminAuth = require('../middleware/adminAuth')
const multer = require('../middleware/multer');

// ==========================CONTROLLERS=================================
const adminController = require("../controller/adminController");
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController')
const salesReportController = require('../controller/salesReportController');
const offerController = require('../controller/offerController')

// ====================SETTING VIEWS===========================
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

// ==========================ADMIN DASH======================
adminRoute.get('/', adminController.adminLogin);
adminRoute.post('/', adminController.verifyLogin);
adminRoute.get('/adminDashboard', adminAuth.isLogin, adminController.loadDashboard);

// ==========================SALES REPORT====================================
adminRoute.get('/salesDaily', adminAuth.isLogin, salesReportController.dailySalesReport);
adminRoute.post('/customDate', adminAuth.isLogin, salesReportController.customDateSort);
adminRoute.get('/salesWeekly', adminAuth.isLogin, salesReportController.weeklySalesReport);
adminRoute.get('/salesMonthly', adminAuth.isLogin, salesReportController.monthlySalesReport);
adminRoute.get('/salesyearly', adminAuth.isLogin, salesReportController.YearlySalesReport);
adminRoute.get('/checkDataExist', adminAuth.isLogin, salesReportController.checkDataExist);

// ==================================USER MANAGMENT================================
adminRoute.get('/users', adminAuth.isLogin, adminController.loadUsers);
adminRoute.post('/users/:action/:id', adminController.userStatus);

// =================================CATEGORY MANAGMENT==============================
adminRoute.get('/Category', adminAuth.isLogin, categoryController.loadCategory);
adminRoute.post('/category/:action/:id', adminAuth.isLogin, categoryController.categoryStatus);
adminRoute.get('/addCategory', adminAuth.isLogin, categoryController.loadAddCatogery);
adminRoute.post('/addCategory', adminAuth.isLogin, categoryController.addCategory);
adminRoute.get('/editCategory', adminAuth.isLogin, categoryController.loadEditCategory);
adminRoute.post('/editCategory', adminAuth.isLogin, categoryController.editCategory);

// ==============================PRODUCT MANAGMENT====================================
adminRoute.get('/product', adminAuth.isLogin, productController.loadProduct);
adminRoute.get('/addProduct', adminAuth.isLogin, productController.loadAddProduct);
adminRoute.post('/addProduct', adminAuth.isLogin, multer.uploadProduct, productController.addProduct);
adminRoute.post('/product/:action/:id', adminAuth.isLogin, productController.productStatus);
adminRoute.get('/editProduct', adminAuth.isLogin, productController.loadeditProduct)
adminRoute.post('/editProduct', adminAuth.isLogin, multer.uploadProduct, productController.editProduct)
adminRoute.post("/deleteImage", adminAuth.isLogin, productController.deleteImg);

// ================================ORDER MANAGMENT========================================
adminRoute.get('/orders', adminAuth.isLogin, orderController.loadAdminOrders);
adminRoute.get('/viewDetails', adminAuth.isLogin, orderController.loadAdminViewDetails);
adminRoute.post('/changeOrderStatus', adminAuth.isLogin, orderController.changeOrderStatus);
adminRoute.post('/cancelOrder', adminAuth.isLogin, orderController.AdminCancelOrder);
adminRoute.post('/changeReturnStatus', adminAuth.isLogin, orderController.changeReturnStatus);

// ============================COUPON MANAGEMENT======================================
adminRoute.get('/coupon', adminAuth.isLogin, couponController.loadCoupon);
adminRoute.get('/addCoupon', adminAuth.isLogin, couponController.loadAddCoupon);
adminRoute.post('/addCoupon', adminAuth.isLogin, couponController.addCoupon);
adminRoute.get('/listCoupon', adminAuth.isLogin, couponController.listCoupon);
adminRoute.get('/editCoupon', adminAuth.isLogin, couponController.loadEditCoupon);
adminRoute.post('/editCoupon', adminAuth.isLogin, couponController.editCoupon)

// ============================OFFER MANAGMENT=========================================
adminRoute.get('/offer', adminAuth.isLogin, offerController.loadOffer)
adminRoute.post('/addOffer', adminAuth.isLogin, offerController.addOffer)
adminRoute.post('/offerType', adminAuth.isLogin, offerController.offerType)
adminRoute.get('/editOffer', adminAuth.isLogin, offerController.loadeditOffer)
adminRoute.post('/editOffer', adminAuth.isLogin, offerController.editOffer)
adminRoute.post('/offerIdSave', adminAuth.isLogin, offerController.offerproductIdSave)
adminRoute.post('/catIdSave', adminAuth.isLogin, offerController.offerCategoryIdSave)
adminRoute.post('/deleteOffer', adminAuth.isLogin, offerController.deleteOffer)

adminRoute.get('/logout', adminAuth.isLogin, adminController.logout);

module.exports = adminRoute;