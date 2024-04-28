const connectDB = require("./database/connection")
require("dotenv").config();
const express = require("express");
const app = express();
const passport = require('passport');
const path = require("path");
const flash = require('express-flash')
const session = require('express-session');
const nocache = require('nocache')
require('./passport-setup');
const userController = require('./controller/userController')
connectDB()


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/assets')));

app.set("view engine", "ejs");

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(nocache())


app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        res.redirect('/success',);
    })
app.get('/success', userController.googleLogin);


const userRoute = require("./routes/userRoute");
app.use('/', userRoute);

const adminRoute = require("./routes/adminRoute");
const exp = require("constants");
app.use('/admin', adminRoute)






const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});