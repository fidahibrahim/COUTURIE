const mongoose = require('mongoose');
const Product = require('./productModel');
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
        requiured: true
    },
    orderId: {
        type: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    expectedDelivery: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: Object,
        required: true
    },
    paymentId: {
        type: String
    },
    discount: {
        type: Number
    },
    products: [
        {
            productId: {
                type: ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String
            },
            price: {
                type: Number
            },
            totalPrice: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ['placed', 'outForDelivery', 'returnRequested', 'returned', 'returnDenied', 'shipped', 'delivered', 'cancelled','pending'],
                default: 'placed'
            },
            quantity: {
                type: Number
            },
            returnReason: {
                type: String
            },
            discountPerItem: {
                type: Number,
                default: 0
            }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema)