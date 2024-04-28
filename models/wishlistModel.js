const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const wishlistSchema =mongoose.Schema({
    userId:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    products:[{
        productId:{
            type:ObjectId,
            ref:'Product',
            required:true
        }
    }]
})

module.exports = mongoose.model('wishlist',wishlistSchema);