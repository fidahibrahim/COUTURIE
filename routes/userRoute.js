const express = require("express");
const userRoute = express();


const userController = require("../controller/userController");
const userAuth = require('../middleware/userAuth');
const profileController = require("../controller/profileController"); // Require profile controller


userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/users')


userRoute.get('/', userAuth.isLogout, userController.loadHome);
userRoute.get('/home', userAuth.isBlocked, userAuth.isLogin, userController.loadHome)

userRoute.get('/register', userAuth.isLogout, userController.loadRegister);
userRoute.post('/register', userController.verifyRegister);

userRoute.get('/login',userAuth.isLogout , userController.loadLogin);
userRoute.post('/login', userController.verifyLogin);
userRoute.get('/success',userController.googleLogin);

userRoute.get('/logout', userAuth.isLogin, userController.logout)

userRoute.get('/otp', userAuth.isLogout, userController.loadOtp);
userRoute.post('/otp', userController.verifyOtp);
userRoute.post('/resend-otp',userAuth.isLogout,userController.resendOtp);

userRoute.get('/forgotPassword',userAuth.isLogout,userController.loadForgotPassword);
userRoute.post('/forgotPassword',userController.forgotPasswordVerify);
userRoute.get('/resetPassword',userController.loadResetPassword);
userRoute.post('/resetPassword',userController.resetPassword);


userRoute.get('/shop', userAuth.isBlocked, userController.loadShop);
userRoute.post('/filter',userController.loadFilter)
userRoute.get('/productDetails', userController.loadProductDetails);

userRoute.get('/blocked-user', userAuth.isLogin, userController.loadBlockedUser);

userRoute.get('/about',userController.loadAbout);
userRoute.get('/contact',userController.loadContact);

userRoute.get('/profile',userAuth.isLogin,profileController.loadProfile);
userRoute.get('/editProfile',userAuth.isLogin,userController.loadEditProfile);
userRoute.post('/editProfile',userController.editProfile);
userRoute.get('/changePass',userAuth.isLogin,profileController.loadChangePass);
userRoute.post('/changePass',profileController.changePass);

module.exports = userRoute