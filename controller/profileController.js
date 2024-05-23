const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const loadProfile = async (req, res) => {
    try {
        id = req.session.userId;
        const userData = await User.findOne({ _id: id })
        res.render('profile', { user: userData });
    } catch (error) {
        res.redirect('/500')
    }
}

const loadEditProfile = async (req, res) => {
    try {
        const id = req.session.userId;
        const userData = await User.findOne({ _id: id })
        res.render('editProfile', { user: userData });
    } catch (error) {
        res.redirect('/500')
    }
}

const editProfile = async (req, res) => {
    try {
        const id = req.session.userId
        const { username, mobile } = req.body

        await User.findByIdAndUpdate(id, { username: username, mobile: mobile });
        res.redirect('/profile');
    } catch (error) {
        res.redirect('/500')
    }
}

const loadChangePass = async (req, res) => {
    try {
        const user=await User.findOne({_id:req.session.userId})
        res.render('changePass',{user})
    } catch (error) {
        res.redirect('/500')
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
        res.redirect('/500')
    }
}

const loadAddress = async (req, res) => {
    try {
        const id = req.session.userId
        const userData = await User.findOne({ _id: id })
        res.render('address', { userData })
    } catch (error) {
        res.redirect('/500')
    }
}

const loadAddAddress = async (req, res) => {
    try {
        const user=await User.findOne({_id:req.session.userId})
        res.render('addAddress',{user})
    } catch (error) {
        res.redirect('/500')
    }
}


const addAddress = async (req, res) => {
    try {
        const { name, state, city, pincode, mobile } = req.body
        const id = req.session.userId
        await User.findByIdAndUpdate({ _id: id }, {
            $push: {
                address: {
                    name: name,
                    state: state,
                    city: city,
                    pincode: pincode,
                    mobile: mobile
                }
            }
        })
        res.redirect('/address');
    } catch (error) {
        res.redirect('/500')
    }
}


const loadEditAddress = async (req, res) => {
    try {
        const user=await User.findOne({_id:req.session.userId})
        const addressId = req.query.addressId
        const addressData = await User.findOne({ "address._id": addressId })
        const foundAddress = addressData.address.find(address => address._id == addressId);
        res.render('editAddress', { addressData: foundAddress ,user})
    } catch (error) {
        res.redirect('/500')
    }
}


const editAddress = async (req, res) => {
    try {
        const userId = req.session.userId
        const {addressId, name, state, city, pincode, mobile } = req.body
        const updatedAddress = await User.findOneAndUpdate({ _id:userId,"address._id":addressId},
            {
                $set: {
                    "address.$.name": name,
                    "address.$.state": state,
                    "address.$.city": city,
                    "address.$.pincode": pincode,
                    "address.$.mobile": mobile,
                }
            },{new: true})

        res.redirect('/address')

    } catch (error) {
        res.redirect('/500')
    }
}

const deleteAddress = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const addressId = req.body.addressId;
        console.log("yjhtre",addressId);
        const deletedAddress = await User.findOneAndUpdate({ _id:userId},{$pull:{address:{_id:addressId}}});
        console.log("dthg",deletedAddress);
        res.json( {deleted:true} )
    } catch (error) {
        res.redirect('/500')
    }

}


module.exports = {
    editProfile,
    loadEditProfile,
    loadProfile,
    loadChangePass,
    changePass,
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress

}