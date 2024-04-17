const mongoose = require('mongoose')
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const moment = require('moment');


const loadOrder = async (req, res) => {
    try {
        const userId = req.session.userId
        const id = req.params.id
        const order = await Order.findOne({ _id: id }).populate('userId');
        const user = await User.findOne({ _id: userId })

        res.render('order', { order, user, moment })
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
        const products = cart.products; 

        let insufficientProducts = [];
        for (const prod of products) { 
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



const loadViewOrder = async (req, res) => {
    try {
        let page = req.query.id ? parseInt(req.query.id) : 1
        const limit = 4;
        let Next = page + 1
        let Previous = page > 1 ? page - 1 : 1
        let count = await Order.find().count()
        console.log("wwwwwwwwwww", count);
        let totalPages = Math.ceil(count / limit)
        console.log("rrrrrrrrrrrrrrr", totalPages);
        if (Next > totalPages) {
            Next = totalPages
        }
        const userId = req.session.userId
        const data = await Order.find({ userId: userId })
            .sort({ date: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec()
        res.render('viewOrders', { orders: data, Next: Next, Previous: Previous, totalPages: totalPages, moment });
    } catch (error) {
        console.log(error);
    }

}
const loadOrderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = req.query.orderId;
        const order = await Order.findOne({ _id: orderId, userId: userId })
            .populate('products.productId')
            .populate({ path: 'userId', populate: { path: 'address' } });
        const user = await User.findById(userId).populate('address');
        res.render('orderDetails', { order, user, moment });
    } catch (error) {
        console.log(error);
    }
}

const loadAdminOrders = async (req, res) => {
    try {
        const order = await Order.find({}).populate('products.productId').populate('userId').sort({ date: -1 })
        res.render('orders', { order, moment })

    } catch (error) {
        console.log(error);
    }
}

const loadAdminViewDetails = async (req, res) => {
    try {
        const { orders } = req.query;
        const orderDetails = await Order.find({ _id: { $in: orders } }).populate('products.productId').populate('userId');

        res.render('viewDetails', { orders: orderDetails, moment });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};

const changeOrderStatus = async (req, res) => {
    try {
        const { orderId, productId, userId, status } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }

        if (typeof productId === 'object' && productId._id) {
            const productIdString = productId._id.toString();

            const productid = new mongoose.Types.ObjectId(productIdString);

            const orderData = await Order.findOneAndUpdate(
                { _id: orderId, userId: userId, 'products.productId': productid },
                { $set: { 'products.$.status': status } }
            );

            return res.json({ change: true });
        } else {
            return res.status(400).json({ error: 'Invalid productId format' });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const cancelOrder = async(req,res)=>{
    try {
        const { orderId, productId, reason} = req.body
        const userId = req.session.userId

        const orderDetails = await Order.findOneAndUpdate(
            { _id: orderId, 'products.productId':productId },
            {$set:{'products.$.status':'cancelled'}})


            const productDetails = await Order.findOne(
                {_id:orderId,'products.productId':productId,},
                { 'products.$': 1 }).populate('products.productId')

            

            const productQty = productDetails.products[0].quantity;
            console.log("nooooooo",productQty);
            await Product.updateOne({ _id: productId }, { $inc: { quantity: productQty } })  

        res.json({ cancel:true })
    } catch (error) {
        console.log(error);
    }
}

const returnRequest = async(req,res)=>{
    try {
        const { orderId, productId, reason} = req.body
        const userId = req.session.userId
        if(userId){
            await Order.findOneAndUpdate({_id:orderId,'products.productId':productId},
             {'products.$.returnReason':reason,
            'products.$status':'returnRequested'
        })
        res.json({Return:true})
            
        }
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    loadOrder,
    placeOrder,
    loadViewOrder,
    loadOrderDetails,
    loadAdminOrders,
    loadAdminViewDetails,
    changeOrderStatus,
    cancelOrder,
    returnRequest

}