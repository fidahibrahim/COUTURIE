const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const moment = require('moment');


const loadOrder = async (req, res) => {
    try {
        const userId = req.session.userId 
        const id = req.params.id
        const order = await Order.findOne({_id:id}).populate('userId');
        const user = await User.findOne({_id:userId})

        res.render('order',{order,user,moment})
    } catch (error) {
        console.log(error);
    }
}

const placeOrder = async (req, res) => {
    try {
        const { address, subTotal, payment } = req.body;
        const userId = req.session.userId;
        const date = new Date();
        const cart = await Cart.findOne({ userId: userId }).populate({
            path: "products.productId",
            model: "Product"
        });
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit" }).replace(/\//g, "-");
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderRand = "MFTS" + randomNum;
        const products = cart.products; // Renamed from 'product' to 'products'

        let insufficientProducts = [];
        for (const prod of products) { // Renamed loop variable from 'product' to 'prod'
            const currentProduct = await Product.findById(prod.productId._id);
            if (currentProduct.quantity < prod.quantity) {
                insufficientProducts.push(prod.productId.name);
            }
        }

        if (insufficientProducts.length > 0) {
            res.json({ quan: true, insufficientProducts });
        } else {
            const user = await User.findOne({ id: userId });
            const status = "placed";
            const date = Date.now();
            const order = new Order({
                userId: userId,
                orderId: orderRand,
                totalAmount: subTotal,
                date: date,
                expectedDelivery: deliveryDate,
                status: status,
                paymentMethod: payment,
                deliveryAddress: address,
                products: products
            });
            const orderDetails = await order.save();
            const orderId = orderDetails._id;

            await Cart.deleteOne({ userId: userId });
            for (let i = 0; i < products.length; i++) {
                const productId = products[i].productId;
                const productQuantity = products[i].quantity;
                await Product.updateOne({ _id: productId }, { $inc: { quantity: -productQuantity } });
            }
            res.json({ success: true, orderId });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



const loadViewOrder = async(req,res)=>{
    try {
        const userId = req.session.userId
        const data = await Order.find({userId:userId}).sort({ date:-1 })
        res.render('viewOrders',{orders:data,moment});
    } catch (error) {
        console.log(error);
    }

}
const loadOrderDetails = async(req,res)=>{
    try {
        const userId = req.session.userId;
        const orderId = req.query.orderId;
        const order = await Order.findOne({_id:orderId,userId:userId})
            .populate('products.productId')
            .populate({ path: 'userId', populate: { path: 'address' } });
        const user = await User.findById(userId).populate('address');
        res.render('orderDetails',{order,user,moment});
    } catch (error) {
        console.log(error); 
    }
}

const loadAdminOrders = async(req,res)=>{
    try {
        const order = await Order.find({}).populate('products.productId').populate('userId').sort({date:-1})
        res.render('orders',{order,moment})
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadOrder,
    placeOrder,
    loadViewOrder,
    loadOrderDetails,
    loadAdminOrders
}