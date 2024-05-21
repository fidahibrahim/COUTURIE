const category = require('../models/category');
const product = require('../models/productModel');
const path = require('path')
const fs = require('fs')

const loadProduct = async (req, res) => {
    try {
        let page = 1;
        if (req.query.id) {
            page = req.query.id
        }
        const limit = 5
        let Next = page + 1
        let Previous = page > 1 ? page - 1 : 1

        let count = await product.find().count()

        let totalPages = Math.ceil(count / limit)
        if (Next > totalPages) {
            Next = totalPages
        }

        const products = await product.find({})
            .populate('category')
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .exec()

        res.render('product',
            {
                products: products,
                Next: Next,
                Previous: Previous,
                totalPages: totalPages,
                currentPage: page,
                pageSize: limit
            })
    } catch (error) {
        res.redirect('/500');
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categories = await category.find({})
        res.render('addProduct', { category: categories });
    } catch (error) {
        res.redirect('/500')
    }
}


const addProduct = async (req, res) => {
    try {
        console.log("req.body", req.body);
        console.log("req.files", req.files);
        const { productName, productDescription, Price, category, Quantity } = req.body
        const files = req.files

        const alreadyExist = await product.findOne({ name: productName })

        if (alreadyExist) {
            return res.json({ success: false, message: 'Item already existed' })
        } else {
            const images = files.map(file => file.filename);

            console.log("my images", images);


            const products = new product({
                name: productName,
                price: Price,
                quantity: Quantity,
                images: images,
                category: category,
                description: productDescription,

            })
            const save = await products.save()
            console.log("save", save);
            if (save) {
                return res.status(200).json({ success: true })

            }
        }
    } catch (error) {
        console.log(error);
        res.redirect('/500')

    }
}

const productStatus = async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = await product.findById(productId);
        if (!productData) {
            return res.status(404).json({ error: "Product not found" });
        }

        const updatedProduct = await product.findByIdAndUpdate(
            productId,
            { $set: { is_Listed: !productData.is_Listed } },
            { new: true }
        );

        res.send({ status: "success", product: updatedProduct });

    } catch (error) {
        res.redirect('/500')
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loadeditProduct = async (req, res) => {
    try {
        const productId = req.query.productId
        const Category = await category.find({ isListed: true })
        const productData = await product.findOne({ _id: productId }).populate("category")
        res.render('editProduct', { category: Category, products: productData })

    } catch (error) {
        res.redirect('/500')

    }
}


const editProduct = async (req, res) => {
    try {
        const { productName, category, price, description, quantity, id, oldimageUrl } = req.body
        console.log("my edit body", req.body);
        const alreadyExist = await product.findOne({ _id: { $ne: id }, productName: productName })

        if (alreadyExist) {

            return res.json({ success: false, message: 'Item already existed' })
        }

        const filename = req.files.map(item => {
            return item.filename
        })

        const upload = await product.findOne({ _id: id })
        let array = upload.images
        console.log("upload", upload);

        if (oldimageUrl && oldimageUrl.length) {
            const oldImagesToRemove = JSON.parse(oldimageUrl);
            array = array.filter(item => !oldImagesToRemove.includes(item));

        }
        array.push(...filename)
        console.log("array", array);

        const edit = await product.updateOne({ _id: id },
            {
                $set:
                {
                    name: productName,
                    category: category,
                    price: price,
                    description: description,
                    quantity: quantity,
                    images: array
                }
            })

        console.log('edit', edit);
        if (edit) {

            res.status(200).json({ success: true })

        }


    } catch (error) {

        console.log(error);
        res.redirect('/500')

    }
}

const deleteImg = async (req, res) => {
    try {
        const { preview, filename, id } = req.body;
        const fullpath = path.join(__dirname, "..", "public", preview);
        fs.unlink(fullpath, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: "Error deleting image" });
            }
            try {
                const result = await product.updateOne({ _id: id }, { $pull: { images: filename } });
                console.log(result);
                res.status(200).json({ success: true });
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, error: "Error updating product" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};


module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    productStatus,
    loadeditProduct,
    editProduct,
    deleteImg,

}