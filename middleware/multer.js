const multer = require('multer');
const path = require('path')

const upload = multer.diskStorage({
   
    destination: './public/assets/images/productImg/sharpedImg',
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename)

    }

})


const product = multer({ storage: upload })
const uploadProduct=product.array('cropImages',3)
module.exports = {
    uploadProduct
}


