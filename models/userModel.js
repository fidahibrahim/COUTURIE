const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },

    verified:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_admin:{
        type:Number,
        default:0
    }

});

module.exports = mongoose.model("User",userSchema);