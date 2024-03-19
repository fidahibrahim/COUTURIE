const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: ObjectId,
        ref: "category",
        required: true
    },
    images: {
        type: Array,
        validate: [arrayLimit, 'you can pass only 3 images']
    },
    is_Listed: {
        type: Boolean, 
        default: true,
    },
    stock: {
        type: Number,
        required: true
    }
},{timestamps:true});
function arrayLimit(val) {
    return val.length <= 3;
}

module.exports = mongoose.model('Product',productSchema);