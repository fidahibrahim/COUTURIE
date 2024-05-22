const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const moment = require('moment')
const Offer=require('../models/offerModel')

const loadCheckout = async (req, res) => {
    try {
        const id = req.session.userId;
        const userData = await User.findOne({ _id: id });
        const cartCount = await Cart.countDocuments({ userId:req.session.userId })
        const cartDetails = await Cart.findOne({ userId: userData }).populate({
            path: "products.productId",
            model: "Product"
        });
        const user = await User.findOne({ _id: userData });
        const currentDate = new Date();
        const couponData = await Coupon.find({ status: true, activationDate: { $lte: currentDate }, expiryDate: { $gte: currentDate } });
        let offerData = await Offer.find({startDate: { $lte: new Date() },endDate: { $gte: new Date() }});

        let subTotal = 0;
        let totalSavings = 0; 
        let cartId = null;

        if (cartDetails) {
            cartDetails.products.forEach((product) => {
                let itemPrice = product.productPrice;

               
                let appliedOffer = null;
                const productOffer = offerData.find(offer =>
                    offer.offerType === 'product' &&
                    offer.productId.includes(product.productId._id.toString())
                );

                const categoryOffer = offerData.find(offer =>
                    offer.offerType === 'category' &&
                    offer.categoryId.includes(product.productId.category._id.toString())
                );

                if (productOffer || categoryOffer) {
                    if (productOffer && categoryOffer) {
                        if (productOffer.discount > categoryOffer.discount) {
                            appliedOffer = productOffer;
                        } else {
                            appliedOffer = categoryOffer;
                        }
                    } else if (productOffer) {
                        appliedOffer = productOffer;
                    } else {
                        appliedOffer = categoryOffer;
                    }
                    let discountedPrice = Math.round(itemPrice);
                    console.log("ddddddddddddd",itemPrice,appliedOffer.discount,discountedPrice);
                    product.discountedPrice = discountedPrice;
                    product.appliedOffer = appliedOffer;
                    product.offerText = `${appliedOffer.discount}% off`;
                    subTotal += discountedPrice * product.quantity;
                    let savings = Math.round(product.productId.price * product.quantity - discountedPrice * product.quantity)
                    totalSavings += Math.round(savings);
                } else {
                    subTotal += itemPrice * product.quantity;
                }
            });
            cartId = cartDetails._id;
        } else {
            return res.render('cart', { cartDetails, user, subTotal: 0, totalSavings: 0, cartId, coupon: couponData, moment });
        }
        res.render('checkout', { userData, cartDetails,cartCount, user, subTotal, totalSavings:0, cartId, coupon: couponData, moment })
    } catch (error) {
        console.log(error);
    }
}


const loadAddCheckoutAddress = async (req, res) => {
    try {
        res.render('checkoutAddAddress');
    } catch (error) {
        res.redirect('/500')
    }
}

const addCheckoutAddress = async (req, res) => {
    try {
        const id = req.session.userId
        const { name, state, city, pincode, mobile } = req.body
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
        res.redirect('/checkout')
    } catch (error) {
        res.redirect('/500')
    }
}

const loadEditCheckoutAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId
        const addressData = await User.findOne({ "address._id": addressId })
        console.log("qwertyui", addressData);
        const foundAddress = addressData.address.find(address => address._id == addressId)
        res.render('checkoutEditAddress', { addressData: foundAddress })
    } catch (error) {
        res.redirect('/500')
    }
}

const editCheckoutAddress = async (req, res) => {
    try {
        const userId = req.session.userId
        const { addressId, name, state, city, pincode, mobile } = req.body
        const updatedAddress = await User.findOneAndUpdate({ _id: userId, "address._id": addressId },
            {
                $set: {
                    "address.$.name": name,
                    "address.$.state": state,
                    "address.$.city": city,
                    "address.$.pincode": pincode,
                    "address.$.mobile": mobile,
                }
            }, { new: true })
        res.redirect('/checkout')
    } catch (error) {
        res.redirect('/500')
    }
}
module.exports = {
    loadCheckout,
    loadAddCheckoutAddress,
    loadEditCheckoutAddress,
    editCheckoutAddress,
    addCheckoutAddress

}