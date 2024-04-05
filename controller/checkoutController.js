const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

const loadCheckout = async(req,res)=>{
    try {
        const id = req.session.userId;
        const userData = await User.findOne({_id:id});
        const cartDetails = await Cart.findOne({userId:userData}).populate({
            path:"products.productId",
            model:"Product"
        });
        const user = await User.findOne({_id:userData});

        let subTotal = 0;
        let cartId = null;

        if(cartDetails){
            cartDetails.products.forEach((product)=>{
                let itemPrice = product.productId.price;
                subTotal += itemPrice*product.quantity; 
            });
            cartId = cartDetails._id;
        }else{
            return res.render('cart', { cartDetails,user, subTotal: 0, discountAmnt: 0, cartId });
        }
        res.render('checkout',{userData,cartDetails,user,subTotal,cartId})
    } catch (error) {
        console.log(error);
    }
}

const loadAddCheckoutAddress = async(req,res)=>{
    try {
        res.render('checkoutAddAddress');
    } catch (error) {
        console.log(error);
    }
}

const addCheckoutAddress = async(req,res)=>{
    try {
        const id = req.session.userId
        const {name,state,city,pincode,mobile} = req.body
        await User.findByIdAndUpdate({_id:id},{
            $push:{
                address:{
                    name:name,
                    state:state,
                    city:city,
                    pincode:pincode,
                    mobile:mobile
                }
            }
        })
        res.redirect('/checkout')
    } catch (error) {
       console.log(error); 
    }
}

const loadEditCheckoutAddress = async(req,res)=>{
    try {
        const addressId = req.query.addressId
        const addressData = await User.findOne({"address._id":addressId})
        console.log("qwertyui",addressData);
        const foundAddress = addressData.address.find(address =>address._id == addressId)
        res.render('checkoutEditAddress', {addressData:foundAddress})
    } catch (error) {
        console.log(error);
    }
}

const editCheckoutAddress = async(req,res)=>{
    try {
        const userId = req.session.userId
        const {addressId,name,state,city,pincode,mobile} = req.body
        const updatedAddress = await User.findOneAndUpdate({_id:userId,"address._id":addressId},
        {
            $set:{
                "address.$.name":name,
                "address.$.state":state,
                "address.$.city":city,
                "address.$.pincode":pincode,
                "address.$.mobile":mobile,
            }
        },{new:true})
        res.redirect('/checkout')
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    loadCheckout,
    loadAddCheckoutAddress,
    loadEditCheckoutAddress,
    editCheckoutAddress,
    addCheckoutAddress

}