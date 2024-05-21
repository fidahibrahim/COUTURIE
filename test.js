const model

const addcatee = async (req,res)=>{
    try {
        const {name,age} = req.body
       const data= new Model({
        name:name,
        age:age
       })
       await data.save()

    } catch (error) {
        
    }
}


const existing = await model.findOne({name:productName})




const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({

})

module.exports = mongoose.model('Coupon',couponSchema)


