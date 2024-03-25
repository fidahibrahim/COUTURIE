const User = require('../models/userModel');
const bcrypt = require('bcrypt');

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

const loadChangePass = async (req, res) => {
    try {
        res.render('changePass')
    } catch (error) {
        console.log(error);
    }
}

const changePass = async (req, res) => {
    try {
        const { currentPass, newPass, confirmPass } = req.body

        const id = req.session.userId;

        const userData = await User.findById(id);


        if (!userData) {
            req.flash("message", "User Not Found")
            return res.redirect('/changePass');
        }

        const passwordMatch = await bcrypt.compare(currentPass, userData.password);
        console.log(passwordMatch);

        if (!passwordMatch) {
            req.flash("message", "Incorrect Password")
            return res.redirect('/changePass')
        }

        if (newPass !== confirmPass) {
            req.flash("message", "Password Not Match")
            return res.redirect('/changePass')
        }

        const hashedPass = await bcrypt.hash(newPass, 10);
        await User.findByIdAndUpdate(id, { $set: { password: hashedPass } }, { new: true });
        res.redirect('/profile');

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    editProfile,
    loadEditProfile,
    loadProfile,
    loadChangePass,
    changePass
}