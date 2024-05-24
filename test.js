const orderModel = require("./models/orderModel");

const orderCount = await orderModel.aggregate([{
    $unwind : 'products'
},
{
    $match :{
        'products.status':delivered
    }
},
{
    $group:{
        _id:null,
        count:{$sum:1}
    }
}
])