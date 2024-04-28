const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },

    address: [
        {
            name:{
                type:String
            },
            state:{
                type:String
            },
            city:{
                type:String
            },
            pincode:{
                type:Number
            },
            mobile:{
                type:Number
            }
        }
    ],
    verified: {
        type: Boolean,
        default: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Number,
        default: 0
    },
    token:{
        type:String,
        default:''
    },
    wallet:{
        type:Number,
        default:0
    },
    walletHistory:[{
        date:{
            type:Date
        },
        amount:{
            type:Number
        },
        reason:{
            type:String
        }
    }]


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);