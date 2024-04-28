const User = require('../models/userModel');
const UserVerification = require('../models/userOtpVerification');
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const randomstring = require('randomstring')
const userOtpVerification = require('../models/userOtpVerification');
const category = require('../models/category');
const product = require('../models/productModel');

const loadHome = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.userId })
        res.render("home", { user: userData });

    } catch (error) {
        console.log(error);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render("register");
    } catch (error) {
        console.log(error);
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error);
    }
}

const securePassword = async (password) => {
    try {
        console.log(password, "pass,,,,,,,,,,");
        const securePass = await bcrypt.hash(password, 10);
        return securePass;

    } catch (error) {
        console.log(error);
    }
}

const verifyRegister = async (req, res) => {
    try {


        const { userName, email, password, mobile } = req.body
        console.log(req.body);
        const findUser = await User.findOne({ email: email });
        const findUserByMobile = await User.findOne({ mobile: mobile });
        const findUserByName = await User.findOne({ username: userName });

        if (findUser) {

            const message = 'This user is already existing';
            return res.render('register', { message, userName, email, password, mobile });


        } else if (findUserByName) {

            const message = 'Sorry this username is already taken'
            return res.render('register', { message, userName, email, password, mobile });

        } else if (findUserByMobile) {
            const message = 'This mobile number is already registered';
            return res.render('register', { message, userName, email, password, mobile });
        }
        else {
            const securePass = await securePassword(req.body.password);
            const userData = new User({
                username: userName,
                email: email,
                password: securePass,
                mobile: mobile,
                verified: false
            });
            sendOtpVerification(userData, res)
            await userData.save();

        }
    } catch (error) {
        console.log(error);
    }
}


const googleLogin = async (req, res, next) => {

    const name = req.user.displayName;
    const email = req.user.email;

    const userAlready = await User.findOne({ email: email });

    try {
        if (userAlready) {
            console.log("entered");
            req.flash('message', 'This User is Already Existing.');
            return res.redirect('/login');

        } else {
            const user = new User({ username: name, email });
            await user.save();
            req.session.userId = user;
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error);
    }
}


const sendOtpVerification = async ({ email }, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user:process.env.USER_EMAIL ,
                pass:process.env.USER_PASS 
            }
        })

        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp);

        const emailOptions = {
            from: 'fidahIbrahim2@gmail.com',
            to: email,
            subject: 'verify your email',
            html: `your otp is ${otp}`
        }

        const hashOtp = await bcrypt.hash(otp, 10);

        const newOtpVerification = await new UserVerification({ email: email, otp: hashOtp });
        await newOtpVerification.save();
        await transporter.sendMail(emailOptions);
        res.redirect(`/otp?email=${email}`)
    } catch (error) {
        console.log(error);
    }
}
const loadOtp = async (req, res) => {
    try {
        const email = req.query.email
        res.render('otp', { email: email })
    } catch (error) {
        console.log(error);
    }
}

const verifyOtp = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4;
        const userVerification = await userOtpVerification.findOne({ email });

        if (!userVerification) {
            req.flash('message', 'No OTP verification found for this email.');
            return res.redirect(`/otp?email=${email}`);
        }

        if (userVerification.isExpired()) {
            req.flash('message', 'OTP has expired. Please request a new OTP.');
            await UserVerification.deleteOne({ email });
            return res.redirect(`/otp?email=${email}`);
        }

        const { otp: hashOtp } = userVerification;
        const validOtp = await bcrypt.compare(otp, hashOtp);

        if (validOtp) {
            const userData = await User.findOne({ email });
            if (userData) {
                await User.findByIdAndUpdate(userData._id, { $set: { verified: true } });
            }
        } else {
            req.flash('message', 'Invalid OTP. Please try again.');
            return res.redirect(`/otp?email=${email}`);
        }

        await userOtpVerification.deleteOne({ email });
        req.flash('message', 'OTP verified successfully.');
        return res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('message', 'An error occurred while verifying OTP. Please try again.');
        return res.redirect(`/otp?email=${email}`);
    }
};



const resendOtp = async (req, res) => {
    try {
        const email = req.body.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await UserVerification.deleteOne({ email: email });
        await sendOtpVerification(user, res);


    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};



const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.render('login', { message: 'User not found', email, password })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.render('login', { message: 'Password is incorrect', email, password })
        }

        if (user.is_blocked) {
            return res.render('login', { message: 'You have been blocked. Contact the website for assistance.', email, password })
        }

        if (!user.verified) {
            return res.render('login', { message: 'User not verified. Please verify your account', email, password })
        }

        req.session.userId = user._id
        res.redirect('/home')

    } catch (error) {
        console.log(error);
    }
}


const loadForgotPassword = async (req, res) => {
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error);
    }
}

const forgotPasswordVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {

            if (userData.verified === 0) {

                req.flash("message", "Verify Your Mail");
                return res.redirect("/forgotPassword");

            } else {

                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                sendResetPasswordMail(userData.name, userData.email, randomString);
                req.flash("message", "Please Check Your Mail to Reset Your Password");
                return res.redirect("/forgotPassword");
            }

        } else {
            req.flash("message", "Email Not Found");
            return res.redirect("/forgotPassword");
        }

    } catch (error) {
        console.log(error);
    }
}


const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "fidahibrahim2@gmail.com",
                pass: "hzul wvdm qijl dweg"
            }
        });

        const resetPage = `http://localhost:3000/resetPassword?token=${token}`

        const emailOptions = {
            from: 'fidahibrahim2@gmail.com',
            to: email,
            subject: 'For Reset Password',
            html: `your reset password link is ${resetPage}`
        }

        await transporter.sendMail(emailOptions);
    } catch (error) {
        console.log(error);
    }
}


const loadResetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('resetPassword', { user_id: tokenData._id });

        } else {
            req.flash("message", "Token is Invalid");
            return res.redirect("/forgotPassword");
        }
    } catch (error) {
        console.log(error);
    }
}

const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, id: user } = req.body;
        console.log("my user", user);
        const userData = await User.findOne({ _id: user })
        const oldPassword = await bcrypt.compare(newPassword, userData.password);
        if (oldPassword) {
            return res.render('resetPassword', {
                message: "New password must be different from old password",
                user_id: user,
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render("resetPassword", {
                message: "New password and confirm password should match",
                user_id: user
            });
        }


        const hashedNewPassword = await securePassword(newPassword);
        const updatedData = await User.findByIdAndUpdate({ _id: user }, { $set: { password: hashedNewPassword, token: '' } })
        res.redirect('/login')

    } catch (error) {
        console.log(error);
    }
}



const loadShop = async (req, res) => {
    try {
        let page = 1;
        if (req.query.id) {
            page = req.query.id
        }
        const limit = 8
        let Next = page + 1
        let Previous = page > 1 ? page - 1 : 1
        let count = await product.find().count()
        let totalPages = Math.ceil(count / limit)
        if (Next > totalPages) {
            Next = totalPages
        }
        const user = await User.findOne({ _id: req.session.userId })

        const products = await product.find({ is_Listed: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        const Category = await category.find({ isListed: true })
        res.render('shop', {
            user: user,
            products: products,
            categories: Category,
            Next,
            Previous,
            totalPages
        });
    } catch (error) {
        console.log(error);
    }
}


const loadFilter = async (req, res) => {
    try {
        let filter = { is_Listed: true };
        const selectedCategories = req.body.categories;
        const sortBy = req.body.sortBy;

        if (selectedCategories && selectedCategories.length > 0) {
            filter.category = { $in: selectedCategories };
        }

        let sortOptions = {};
        if (sortBy === "new") {
            sortOptions = { createdAt: -1 };
        } else if (sortBy === "low-high") {
            sortOptions = { price: 1 };
        } else if (sortBy === "high-low") {
            sortOptions = { price: -1 };
        } else if (sortBy === "a-z") {
            sortOptions = { name: 1 };
        }

        const products = await product.find(filter).sort(sortOptions);
        res.json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.productId
        const productData = await product.findOne({ _id: productId }).populate('category')
        res.render('productDetails', { product: productData })
    } catch (error) {
        console.log(error);
    }
}

const logout = async (req, res) => {
    try {
        req.session.userId = null
        res.redirect('/')
    } catch (error) {
        console.log(error);

    }
}

const loadBlockedUser = async (req, res) => {
    try {
        res.render('blocked-user')
    } catch (error) {
        console.log(error);

    }
}

const loadAbout = async (req, res) => {
    try {
        res.render('about');
    } catch (error) {
        console.log(error);
    }
}

const loadContact = async (req, res) => {
    try {
        res.render('contact');
    } catch (error) {
        console.log(error);
    }
}


const loadProfile = async (req, res) => {
    try {
        id = req.session.userId;
        const userData = await User.findOne({ _id: id })
        
        res.render('profile', { user: userData });
    } catch (error) {
        console.log(error);
    }
}

const loadEditProfile = async (req, res) => {
    try {
        const id = req.session.userId;
        const userData = await User.findOne({ _id: id })
        res.render('editProfile', { user: userData });
    } catch (error) {
        console.log(error);
    }
}

const editProfile = async (req, res) => {
    try {
        const id = req.session.userId
        const { username, mobile } = req.body

        await User.findByIdAndUpdate(id, { username: username, mobile: mobile });
        res.redirect('/profile');
    } catch (error) {
        console.log(error);
    }
}

const loadPaymentPolicy = async(req,res)=>{
    try {
        res.render('paymentPolicy')
    } catch (error) {
        console.log(error);
    }
}

const loadWallet = async (req,res)=>{
    try {
        res.render('wallet')
    } catch (error) {
        console.log(error);
    }
}


const loadTransaction = async (req,res)=>{
    try {
        res.render('transaction')
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadHome,
    loadRegister,
    verifyRegister,
    loadLogin,
    loadOtp,
    verifyOtp,
    verifyLogin,
    securePassword,
    loadForgotPassword,
    forgotPasswordVerify,
    sendResetPasswordMail,
    loadResetPassword,
    resetPassword,
    loadShop,
    loadFilter,
    loadProductDetails,
    logout,
    loadBlockedUser,
    googleLogin,
    loadAbout,
    resendOtp,
    loadContact,
    loadProfile,
    loadEditProfile,
    editProfile,
    loadPaymentPolicy,
    loadWallet,
    loadTransaction
}