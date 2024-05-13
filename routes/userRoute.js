const express = require("express");
const userRoute = express();


const userController = require("../controller/userController");
const userAuth = require('../middleware/userAuth');
const profileController = require("../controller/profileController");
const cartController = require("../controller/cartController");
const checkoutController = require('../controller/checkoutController');
const orderController = require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const couponController = require('../controller/couponController')

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users')


userRoute.get('/', userController.loadHome);
userRoute.get('/home', userAuth.isBlocked, userAuth.isLogin, userController.loadHome)

userRoute.get('/register', userAuth.isLogout, userController.loadRegister);
userRoute.post('/register',userAuth.isLogout, userController.verifyRegister);

userRoute.get('/login', userController.loadLogin);
userRoute.post('/login', userController.verifyLogin);
userRoute.get('/success',userController.googleLogin);

userRoute.get('/logout', userAuth.isLogin, userController.logout)

userRoute.get('/otp', userAuth.isLogout, userController.loadOtp);
userRoute.post('/otp', userAuth.isLogout, userController.verifyOtp);
userRoute.post('/resend-otp',userAuth.isLogout,userController.resendOtp);

userRoute.get('/forgotPassword',userAuth.isLogout,userController.loadForgotPassword);
userRoute.post('/forgotPassword',userAuth.isLogin,userController.forgotPasswordVerify);
userRoute.get('/resetPassword',userAuth.isLogin,userController.loadResetPassword);
userRoute.post('/resetPassword',userAuth.isLogin,userController.resetPassword);


userRoute.get('/shop', userAuth.isBlocked, userController.loadShop);
userRoute.post('/shop', userAuth.isBlocked, userController.loadFilter);
userRoute.get('/productDetails', userController.loadProductDetails);

userRoute.get('/blocked-user', userAuth.isLogin, userController.loadBlockedUser);

userRoute.get('/about',userAuth.isLogin,userController.loadAbout);
userRoute.get('/contact',userAuth.isLogin,userController.loadContact);

userRoute.get('/profile',userAuth.isLogin,profileController.loadProfile);
userRoute.get('/editProfile',userAuth.isLogin,userController.loadEditProfile);
userRoute.post('/editProfile',userAuth.isLogin,userController.editProfile);
userRoute.get('/changePass',userAuth.isLogin,profileController.loadChangePass);
userRoute.post('/changePass',userAuth.isLogin,profileController.changePass);
userRoute.get('/address',userAuth.isLogin,profileController.loadAddress);
userRoute.get('/addAddress',userAuth.isLogin,profileController.loadAddAddress);
userRoute.post('/addAddress',userAuth.isLogin,profileController.addAddress);
userRoute.get('/editAddress',userAuth.isLogin,profileController.loadEditAddress);
userRoute.post('/editAddress',userAuth.isLogin,profileController.editAddress);
userRoute.post('/deleteAddress',userAuth.isLogin,profileController.deleteAddress);


userRoute.get('/cart',userAuth.isLogin,cartController.loadCart);
userRoute.post('/addToCart',userAuth.isLogin,cartController.addToCart);
userRoute.post('/deleteCart',userAuth.isLogin,cartController.deleteCart);
userRoute.post('/updateQuantity',userAuth.isLogin,cartController.updateQuantity);


userRoute.get('/checkout',userAuth.isLogin,checkoutController.loadCheckout);
userRoute.get('/checkoutAddAddress',userAuth.isLogin,checkoutController.loadAddCheckoutAddress);
userRoute.post('/checkoutAddAddress',userAuth.isLogin,checkoutController.addCheckoutAddress)
userRoute.get('/checkoutEditAddress',userAuth.isLogin,checkoutController.loadEditCheckoutAddress);
userRoute.post('/checkoutEditAddress',userAuth.isLogin,checkoutController.editCheckoutAddress);
userRoute.post('/applyCoupon',userAuth.isLogin,couponController.applyCoupon)


userRoute.get('/order/:id',userAuth.isLogin,orderController.loadOrder);
userRoute.post('/placeOrder',userAuth.isLogin,orderController.placeOrder);
userRoute.get('/viewOrders',userAuth.isLogin,orderController.loadViewOrder);
userRoute.get('/orderDetails',userAuth.isLogin,orderController.loadOrderDetails);
userRoute.post('/cancelOrder',userAuth.isLogin,orderController.cancelOrder);
userRoute.post("/returnRequest",userAuth.isLogin,orderController.returnRequest);
userRoute.post('/verifyPayment',userAuth.isLogin,orderController.verifyPayment);
userRoute.post('/continuePayment',userAuth.isLogin,orderController.continuePayment);
userRoute.post('/continueVerifyPayment',userAuth.isLogin,orderController.continueVrifyPayment);
userRoute.get('/invoice',userAuth.isLogin,orderController.invoice);


userRoute.get('/wishlist',userAuth.isLogin,wishlistController.loadWishlist);
userRoute.post('/addToWishlist',userAuth.isLogin,wishlistController.addToWishlist);
userRoute.post('/removeFromWishlist',userAuth.isLogin,wishlistController.removeFromWishlist);
userRoute.post('/addCart',userAuth.isLogin,wishlistController.addToCart);

userRoute.get('/paymentPolicy',userAuth.isLogin,userController.loadPaymentPolicy);

userRoute.get('/wallet',userAuth.isLogin,userController.loadWallet);
userRoute.get('/transaction',userAuth.isLogin,userController.loadTransaction)





module.exports = userRoute