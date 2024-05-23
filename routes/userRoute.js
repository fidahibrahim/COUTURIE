const express = require("express");
const userRoute = express();
const userAuth = require('../middleware/userAuth');

// ===============controllers================================
const userController = require("../controller/userController");
const profileController = require("../controller/profileController");
const cartController = require("../controller/cartController");
const checkoutController = require('../controller/checkoutController');
const orderController = require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const couponController = require('../controller/couponController')

// =================setting ejs==============================
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users')

// ===============================USER LOGIN/REGISTER/LOGOUT==================================
userRoute.get('/', userController.loadHome);
userRoute.get('/home', userAuth.isBlocked, userAuth.isLogin, userController.loadHome)
userRoute.get('/register', userAuth.isLogout, userController.loadRegister);
userRoute.post('/register', userAuth.isLogout, userController.verifyRegister);
userRoute.get('/login', userController.loadLogin);
userRoute.post('/login', userController.verifyLogin);
userRoute.get('/success', userController.googleLogin);
userRoute.get('/blocked-user', userAuth.isLogin, userController.loadBlockedUser);
userRoute.get('/logout', userAuth.isLogin, userController.logout)

// ==============================OTP=======================================================
userRoute.get('/otp', userAuth.isLogout, userController.loadOtp);
userRoute.post('/otp', userAuth.isLogout, userController.verifyOtp);
userRoute.post('/resend-otp', userAuth.isLogout, userController.resendOtp);

// ==========================FORGET AND RESET PASSWORD=================================
userRoute.get('/forgotPassword', userAuth.isLogout, userController.loadForgotPassword);
userRoute.post('/forgotPassword', userAuth.isLogin, userController.forgotPasswordVerify);
userRoute.get('/resetPassword', userAuth.isLogin, userController.loadResetPassword);
userRoute.post('/resetPassword', userAuth.isLogin, userController.resetPassword);

// ============================SHOP==========================================
userRoute.get('/shop', userAuth.isBlocked, userController.loadShop);
userRoute.post('/shop', userAuth.isBlocked, userController.loadFilter);
userRoute.get('/productDetails', userController.loadProductDetails);

// =============================USER PROFILE=================================
userRoute.get('/profile',userAuth.isBlocked, userAuth.isLogin, profileController.loadProfile);
userRoute.get('/editProfile',userAuth.isBlocked, userAuth.isLogin, userController.loadEditProfile);
userRoute.post('/editProfile',userAuth.isBlocked, userAuth.isLogin, userController.editProfile);
userRoute.get('/changePass',userAuth.isBlocked, userAuth.isLogin, profileController.loadChangePass);
userRoute.post('/changePass',userAuth.isBlocked, userAuth.isLogin, profileController.changePass);
userRoute.get('/address',userAuth.isBlocked, userAuth.isLogin, profileController.loadAddress);
userRoute.get('/addAddress',userAuth.isBlocked, userAuth.isLogin, profileController.loadAddAddress);
userRoute.post('/addAddress',userAuth.isBlocked, userAuth.isLogin, profileController.addAddress);
userRoute.get('/editAddress',userAuth.isBlocked, userAuth.isLogin, profileController.loadEditAddress);
userRoute.post('/editAddress',userAuth.isBlocked, userAuth.isLogin, profileController.editAddress);
userRoute.post('/deleteAddress',userAuth.isBlocked, userAuth.isLogin, profileController.deleteAddress);
userRoute.get('/wallet',userAuth.isBlocked, userAuth.isLogin, userController.loadWallet);
userRoute.get('/transaction',userAuth.isBlocked, userAuth.isLogin, userController.loadTransaction)

// ==============================USER CART===================================
userRoute.get('/cart',userAuth.isBlocked, userAuth.isLogin, cartController.loadCart);
userRoute.post('/addToCart',userAuth.isBlocked, userAuth.isLogin, cartController.addToCart);
userRoute.post('/deleteCart',userAuth.isBlocked, userAuth.isLogin, cartController.deleteCart);
userRoute.post('/updateQuantity',userAuth.isBlocked, userAuth.isLogin, cartController.updateQuantity);

// =========================CHECKOUT============================================
userRoute.get('/checkout',userAuth.isBlocked, userAuth.isLogin, checkoutController.loadCheckout);
userRoute.get('/checkoutAddAddress',userAuth.isBlocked, userAuth.isLogin, checkoutController.loadAddCheckoutAddress);
userRoute.post('/checkoutAddAddress', userAuth.isLogin, checkoutController.addCheckoutAddress)
userRoute.get('/checkoutEditAddress',userAuth.isBlocked, userAuth.isLogin, checkoutController.loadEditCheckoutAddress);
userRoute.post('/checkoutEditAddress',userAuth.isBlocked, userAuth.isLogin, checkoutController.editCheckoutAddress);
userRoute.post('/applyCoupon',userAuth.isBlocked, userAuth.isLogin, couponController.applyCoupon)
userRoute.get('/paymentPolicy',userAuth.isBlocked, userAuth.isLogin, userController.loadPaymentPolicy);

// =============================ORDER========================================
userRoute.get('/order/:id',userAuth.isBlocked, userAuth.isLogin, orderController.loadOrder);
userRoute.post('/placeOrder', userAuth.isLogin,userAuth.isBlocked, orderController.placeOrder);
userRoute.get('/viewOrders',userAuth.isBlocked, userAuth.isLogin, orderController.loadViewOrder);
userRoute.get('/orderDetails',userAuth.isBlocked, userAuth.isLogin, orderController.loadOrderDetails);
userRoute.post('/cancelOrder',userAuth.isBlocked, userAuth.isLogin, orderController.cancelOrder);
userRoute.post("/returnRequest",userAuth.isBlocked, userAuth.isLogin, orderController.returnRequest);
userRoute.post('/verifyPayment',userAuth.isBlocked, userAuth.isLogin, orderController.verifyPayment);
userRoute.post('/continuePayment',userAuth.isBlocked, userAuth.isLogin, orderController.continuePayment);
userRoute.post('/continueVerifyPayment',userAuth.isBlocked, userAuth.isLogin, orderController.continueVrifyPayment);
userRoute.get('/invoice',userAuth.isBlocked, userAuth.isLogin, orderController.invoice);

// ========================WHISLIST==============================================
userRoute.get('/wishlist',userAuth.isBlocked, userAuth.isLogin, wishlistController.loadWishlist);
userRoute.post('/addToWishlist',userAuth.isBlocked, userAuth.isLogin, wishlistController.addToWishlist);
userRoute.post('/removeFromWishlist',userAuth.isBlocked, userAuth.isLogin, wishlistController.removeFromWishlist);
userRoute.post('/addCart',userAuth.isBlocked, userAuth.isLogin, wishlistController.addToCart);
userRoute.get('/about',userAuth.isBlocked, userAuth.isLogin, userController.loadAbout);
userRoute.get('/contact',userAuth.isBlocked, userAuth.isLogin, userController.loadContact);

module.exports = userRoute