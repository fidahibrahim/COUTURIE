const mongoose = require('mongoose')
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const moment = require('moment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const couponModel = require('../models/couponModel');
const Offer = require('../models/offerModel')


var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const loadOrder = async (req, res) => {
    try {
        const userId = req.session.userId
        const id = req.params.id
        const order = await Order.findOne({ _id: id }).populate('userId');
        const user = await User.findOne({ _id: userId })

        res.render('order', { order, user, moment })
    } catch (error) {
        res.redirect('/500')
    }
}

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const userData = await User.findOne({ _id: userId })
        if (userData.blocked) {
            return res.json({ blocked: true });
        }
        const { address, subTotal, payment, couponCode } = req.body;
        console.log("my address:", address)
        const cart = await Cart.findOne({ userId: userId }).populate({
            path: "products.productId",
            model: "Product"
        });
        const products = cart.products;
        const date = new Date();
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit" }).replace(/\//g, "-");
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const orderRand = "MFTS" + randomNum;
        const status = payment == 'COD' ? 'placed' : 'pending';
        const coupon = await couponModel.findOne({ couponCode: couponCode })
        const discountedAmt = coupon ? subTotal * (parseFloat(coupon.discountAmount) / 100) : 0

        let finalAmount = subTotal
        let discountPerItem = 0;

       

        if (coupon) {
            coupon.userUsed.push({ userId: userId })
            await coupon.save()
            let discounted = Math.round(subTotal * (parseFloat(coupon.discountAmount) / 100))
            finalAmount -= discounted
            const numberOfproduct = cart.products.length
            discountPerItem = Math.round(discounted / numberOfproduct)
        }

        const updatedProducts = products.map(product => {
            const updatedProduct = { ...product, status: status, discountPerItem: discountPerItem }
            return updatedProduct
        })


        let unlistedProducts = [];
        for (const prod of products) {
            const currentProduct = await Product.findById(prod.productId._id);
            if (!currentProduct || !currentProduct.is_Listed) {
                unlistedProducts.push(prod.productId.name);
            }
        }

        if (unlistedProducts.length > 0) {
            return res.json({ unlistedProducts });
        }

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

            const date = Date.now();
            const order = new Order({
                userId: userId,
                orderId: orderRand,
                totalAmount: finalAmount,
                date: date,
                expectedDelivery: deliveryDate,
                status: status,
                paymentMethod: payment,
                deliveryAddress: address,
                products: updatedProducts,
                discount: coupon ? discountedAmt : 0
            });
            let orderDetails = await order.save();
            const orderId = orderDetails._id;

            if (coupon) {
                let discounted = Math.round(subTotal * (parseFloat(coupon.discountAmount) / 100))
                await Order.findOneAndUpdate({ _id: orderId }, { $set: { couponApplied: discounted } })

            }


            if (orderDetails.paymentMethod == 'COD') {
                if (finalAmount > 1000) {
                    return res.json({ min: true })
                } else {
                    await Cart.deleteOne({ userId: userId });
                    for (let i = 0; i < products.length; i++) {
                        const productId = products[i].productId;
                        const productQuantity = products[i].quantity;
                        await Product.updateOne({ _id: productId }, { $inc: { quantity: -productQuantity } });
                    }

                    res.json({ success: true, orderId });
                }
            } else if (orderDetails.paymentMethod == 'WALLET') {
                if (userData.wallet < finalAmount) {
                    return res.json({ insufficientBalance: true })
                } else {
                    userData.wallet -= finalAmount
                    userData.walletHistory.push({
                        date: new Date(),
                        reason: 'Debited',
                        amount: finalAmount
                    })
                    await userData.save()

                    await Order.findOneAndUpdate({ _id: orderId, userId: userId }, { $set: { "products.$[].status": "placed" } })

                    await Cart.deleteOne({ userId: userId });
                    for (let i = 0; i < products.length; i++) {
                        const productId = products[i].productId;
                        const productQuantity = products[i].quantity;
                        await Product.updateOne({ _id: productId }, { $inc: { quantity: -productQuantity } });
                    }
                    return res.json({ success: true, orderId });

                }
            } else if (orderDetails.paymentMethod == 'RAZORPAY') {
                var options = {
                    amount: finalAmount * 100,
                    currency: 'INR',
                    receipt: "" + orderId,
                }
                instance.orders.create(options, function (err, order) {
                    return res.json({ success: false, order: order })
                })
            }

        }

    } catch (error) {
        console.log(error);
        res.redirect('/500')
    }
};

const verifyPayment = async (req, res) => {
    try {
        const cartData = await Cart.findOne({ userId: req.session.userId });
        const cartProducts = cartData.products
        const details = req.body
        secretKey = process.env.RAZORPAY_KEY_SECRET
        const hmac = crypto.createHmac("sha256", secretKey);

        // Updating the HMAC with the data
        hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id)
        console.log("my razorpay orderid", details.payment.razorpay_order_id)
        console.log("my razorpay paymentid", details.payment.razorpay_payment_id)

        const hmacFormat = hmac.digest("hex");
        console.log("my hmac", hmacFormat);
        console.log('my details is here', details.payment.razorpay_signature)

        if (hmacFormat == details.payment.razorpay_signature) {
            await Order.updateOne(
                { "_id": details.order.receipt },
                {
                    $set: {
                        "paymentId": details.payment.razorpay_payment_id,
                        "status": "placed",
                        "products.$[].status": "placed",
                    }
                }
            )

            for (let i = 0; i < cartProducts.length; i++) {
                let count = cartProducts[i].quantity;
                await Product.updateOne(
                    { "_id": cartProducts[i].productId },
                    { $inc: { "quantity": -count } }
                );
            }
            await Cart.deleteOne({ userId: req.session.userId });
            res.json({ success: true, params: details.order.receipt });
        }
        else {
            await Order.deleteOne({ "orderId": details.order.receipt });
            res.json({ success: false });
        }

    } catch (error) {
        res.redirect('/500')

    }
}


const loadViewOrder = async (req, res) => {
    try {
        let page = req.query.id ? parseInt(req.query.id) : 1
        const limit = 4;
        let Next = page + 1
        let Previous = page > 1 ? page - 1 : 1
        let count = await Order.find().count()
        console.log(count);
        let totalPages = Math.ceil(count / limit)
        console.log("ttttttttttttt", totalPages);
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
        res.redirect('/500')
    }

}


const invoice = async (req, res) => {
    try {
        const { id } = req.query
        let orders
        const order = await Order.findOne({ _id: id })
        if (order.couponUsed) {
            orders = await Order.findOne({ _id: id }).populate('products.productId').populate('couponUsed')
        } else {
            orders = await Order.findOne({ _id: id }).populate('products.productId')
        }

        let deliveryAddress = orders.deliveryAddress.split(',').map(item => item.trim());
        console.log("gy", deliveryAddress);
        const user = await User.findOne({ _id: req.session.userId })
        const email = user.email

        console.log("my orders", orders);

        res.render('invoice', { orders, email, deliveryAddress })


    } catch (error) {
        res.redirect('/500')
    }
}





const loadOrderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = req.query.orderId;
        const order = await Order.findOne({ _id: orderId, userId: userId })
            .populate('products.productId')
            .populate({ path: 'userId', populate: { path: 'address' } });

        
        const offerData = await Offer.find({ startDate: { $lte: new Date() }, endDate: { $gte: new Date() } });

        
        for (let product of order.products) {
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

            
                let itemPrice = product.productId.price;
                let discountedPrice = itemPrice - (itemPrice * appliedOffer.discount / 100);
                product.discountedPrice = discountedPrice;
                product.appliedOffer = appliedOffer;
                product.offerText = `${appliedOffer.discount}% off`;
                product.savedAmount = Math.round(itemPrice - discountedPrice)
            }
        }

        const user = await User.findById(userId).populate('address');
        res.render('orderDetails', { order, user, moment });
    } catch (error) {
        res.redirect('/500')
    }
}


const loadAdminOrders = async (req, res) => {
    try {
        let page = 1
        if (req.query.id) {
            page = req.query.id
        }
        const limit = 5
        let Next = page + 1
        let Previous = page > 1 ? page - 1 : 1
        let count = await Order.find().count()
        let tota
        const order = await Order.find({}).populate('products.productId').populate('userId').sort({ date: -1 })
        res.render('orders', { order, moment })

    } catch (error) {
        res.redirect('/500')
    }
}

const loadAdminViewDetails = async (req, res) => {
    try {
        const { orders } = req.query;
        const orderDetails = await Order.find({ _id: { $in: orders } }).populate('products.productId').populate('userId');
        res.render('viewDetails', { orders: orderDetails, moment });
    } catch (error) {
        res.redirect('/500')
        res.status(500).send("Internal Server Error");
    }
};

const changeOrderStatus = async (req, res) => {
    try {
        const { orderId, productId, userId, status } = req.body;
        const orderData = await Order.findOneAndUpdate(
            { _id: orderId, userId: userId, 'products.productId': productId },
            { $set: { 'products.$.status': status } }
        );
        return res.json({ change: true });
    } catch (error) {
        res.redirect('/500')
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { orderId, productId, reason } = req.body
        const userId = req.session.userId

        const orderDetails = await Order.findOneAndUpdate(
            { _id: orderId, 'products.productId': productId },
            { $set: { 'products.$.status': 'cancelled' } })


        const productDetails = await Order.findOne(
            { _id: orderId, 'products.productId': productId, },
            { 'products.$': 1 }).populate('products.productId')

        const total = orderDetails.couponApplied ? productDetails.products[0].productId.price * productDetails.products[0].quantity - orderDetails.couponApplied : productDetails.products[0].quantity
        console.log(total);

        if (orderDetails.paymentMethod == 'RAZORPAY' || orderDetails.paymentMethod == 'WALLET') {
            const user = await User.findOne({ _id: userId })
            user.wallet += total
            const data = {
                amount: total,
                reason: 'Credited',
                date: new Date()
            }
            user.walletHistory.push(data)
            user.save()
        }

        const productQty = productDetails.products[0].quantity;
        await Product.updateOne({ _id: productId }, { $inc: { quantity: productQty } })

        res.json({ cancel: true })
    } catch (error) {
        console.log(error);
        res.redirect('/500')
    }
}

const returnRequest = async (req, res) => {
    try {
        const { orderId, productId, reason } = req.body
        const userId = req.session.userId
        if (userId) {
            await Order.findOneAndUpdate({ _id: orderId, 'products.productId': productId },
                {
                    'products.$.returnReason': reason,
                    'products.$.status': 'returnRequested'
                })
            res.json({ Return: true })

        }
    } catch (error) {
        res.redirect('/500')
    }
}

const AdminCancelOrder = async (req, res) => {
    try {
        const { orderId, productId } = req.body
        console.log(req.body);
        const userId = req.session.userId
        const orderData = await Order.findOneAndUpdate(
            { _id: orderId, 'products.productId': productId },
            { $set: { 'products.$.status': 'cancelled' } }
        )
        const productDetails = await Order.findOne(
            { _id: orderId, 'products.productId': productId },
            { 'products.$': 1 }
        )

        console.log("kuhu", productDetails);


        const total = orderData.couponApplied ?
            productDetails.products[0].totalPrice - orderData.couponApplied :
            productDetails.products[0].totalPrice;

        console.log(total);


        if (orderData.paymentMethod == 'RAZORPAY' || orderData.paymentMethod == 'WALLET') {
            const user = await User.findOne({ _id: userId })
            user.wallet += total
            const data = {
                amount: total,
                reason: 'Credited',
                date: new Date()
            }
            user.walletHistory.push(data)
            user.save()
        }



        const productQty = productDetails.products[0].quantity
        await Product.updateOne({ _id: productId }, { $inc: { quantity: productQty } })
        res.json({ cancel: true })

    } catch (error) {
        console.log(error);
        res.redirect('/500')
    }
}


const changeReturnStatus = async (req, res) => {

    try {
        const { orderId, productId, status, userId } = req.body;
        if (status === 'returned') {
            const user = await User.findOne({ _id: userId })
            if (user) {
                const order = await Order.findOne({ _id: orderId })
                const productDetails = await Order.findOne(
                    { _id: orderId, 'products.productId': productId },
                    { 'products.$': 1 }
                ).populate('products.productId')

                if (order.couponApplied) {
                    let amount = productDetails.products[0].productId.price * productDetails.products[0].quantity - order.couponApplied
                    user.wallet += amount

                    user.walletHistory.push({
                        date: new Date(),
                        amount: amount,
                        reason: `Credited`
                    });


                    await user.save();

                } else {
                    let amount = productDetails.products[0].productId.price * productDetails.products[0].quantity;
                    user.wallet += amount

                    user.walletHistory.push({
                        date: new Date(),
                        amount: amount,
                        reason: `Credited`
                    });


                    await user.save();


                }


                await Order.findOneAndUpdate(
                    { _id: orderId, 'products.productId': productId },
                    { 'products.$.status': status }
                )
                await Product.findOneAndUpdate({ _id: productId }, { $inc: { quantity: 1 } })
                res.json({ changed: true })
            }
        } else {
            await Order.findOneAndUpdate(
                { _id: orderId, 'products.productId': productId },
                { 'products.$.status': status }
            )
            res.json({ changed: true })
        }

    } catch (error) {
        res.redirect('/500')
        res.status(500).json({ error: 'An error occurred' });

    }
};

const continuePayment = async (req, res) => {
    try {
        const { orderId, amount } = req.body
        console.log("yggy", req.body);

        var options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: "" + orderId,
        }
        instance.orders.create(options, function (err, order) {
            res.json({ success: true, order })
        })

    } catch (error) {
        res.redirect('/500')
        res.status(500).json({ error: 'An error occurred' });
    }
}

const continueVrifyPayment = async (req, res) => {
    try {
        const cartData = await Cart.findOne({ userId: req.session.userId });
        const cartProducts = cartData.products
        const { payment, order } = req.body
        console.log("gug", req.body);
        const userId = req.session.userId

        secretKey = process.env.RAZORPAY_KEY_SECRET
        const hmac = crypto.createHmac("sha256", secretKey);

        // Updating the HMAC with the data
        hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
        console.log("my razorpay orderid", payment.razorpay_order_id)
        console.log("my razorpay paymentid", payment.razorpay_payment_id)

        const hmacFormat = hmac.digest("hex");
        console.log("my hmac", hmacFormat);
        console.log('my details is here', payment.razorpay_signature)

        if (hmacFormat == payment.razorpay_signature) {
            await Order.updateOne(
                { "_id": order.receipt },
                {
                    $set: {
                        "paymentId": payment.razorpay_payment_id,
                        "status": "placed",
                        "products.$[].status": "placed",
                    }
                }
            )
            for (let i = 0; i < cartProducts.length; i++) {
                let count = cartProducts[i].quantity;
                await Product.updateOne(
                    { "_id": cartProducts[i].productId },
                    { $inc: { "quantity": -count } }
                );
            }
            await Cart.deleteOne({ userId: userId });
            const orderId = order.receipt
            res.json({ paymentSuccess: true, orderId });
        }

    } catch (error) {
        console.log(error);
        res.redirect('/500')

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
    returnRequest,
    AdminCancelOrder,
    changeReturnStatus,
    verifyPayment,
    continuePayment,
    continueVrifyPayment,
    invoice

}