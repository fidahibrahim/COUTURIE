const User = require('../models/userModel');
const UserVerification = require('../models/userOtpVerification');
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
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


const googleLogin = async(req,res,next)=>{
    
    const name = req.user.displayName;
    const email = req.user.email;

    const userAlready = await User.findOne({ email: email });

    try {
        if(userAlready){
            console.log("entered");
            req.flash('message', 'This User is Already Existing.');
            return res.redirect('/login');
       
        }else{
            const user = new User({username:name, email});
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
                user: "fidahibrahim2@gmail.com",
                pass: "hzul wvdm qijl dweg"
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




const loadShop = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.userId })
        const Category = await category.find({ isListed: true })
        const products = await product.find({
            is_Listed: true,
            category: { $in: Category.map(cat => cat._id) }
        });
        res.render('shop', { user: user, products: products, categories: Category });
    } catch (error) {
        console.log(error);
    }
}

const loadFilter = async (req, res) => {
    try {
        const selectedCategories = req.body.categories;
        const products = await product.find({
            is_Listed: true,
            category: { $in: selectedCategories }
        });
        res.json(products);

    } catch (error) {
        console.log(error);

    }
}

const loadProductDetails = async (req, res) => {
    try {
        const productId = req.query.productId
        const productData = await product.findOne({ _id: productId }).populate('category')
        console.log(productData);
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

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const hashOtp = await bcrypt.hash(otp, 10);
        let userVerification = await UserVerification.findOne({ email });
        if (!userVerification) {
            userVerification = new UserVerification({ email, otp: hashOtp });
        } else {
            userVerification.otp = hashOtp;
        }
        await userVerification.save();
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

        const emailOptions = {
            from: 'fidahIbrahim2@gmail.com',
            to: email,
            subject: 'Verify your email',
            html: `Your new OTP is ${otp}`
        };

        await transporter.sendMail(emailOptions);

        res.status(200).json({ message: 'OTP resent successfully' });

    } catch (error) {
        console.log(error);

    }
}


const loadAbout = async(req,res)=>{
    try {
        res.render('about');
    } catch (error) {
       console.log(error); 
    }
}

const loadContact = async(req,res)=>{
    try {
        res.render('contact');
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
    loadShop,
    loadProductDetails,
    logout,
    loadBlockedUser,
    loadFilter,
    googleLogin,
    loadAbout,
    resendOtp,
    loadContact
}