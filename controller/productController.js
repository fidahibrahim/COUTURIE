const category = require('../models/category');
const product = require('../models/productModel');
const path=require('path')
const fs=require('fs')
const sharp = require("sharp");

const loadProduct = async (req, res) => {
    try {
        const products = await product.find({}).populate('category').sort({createdAt:-1})
        res.render('product', { products: products })
    } catch (error) {
        console.log(error);
    }
}

const loadAddProduct = async (req, res) => {
    try {
        const categories = await category.find({})
        res.render('addProduct', { category: categories });
    } catch (error) {
        console.log(error);
    }
}
const addProduct = async (req, res) => {
    try {
        const { productName, productDescription, Price, Category, Quantity } = req.body;
        console.log(req.body);
        const files = req.files;
        let arrImages = [];
        if (Array.isArray(req.files)) {
            for (let i = 0; i < req.files.length; i++) {
                arrImages[i] = req.files[i].filename;
            }
        }

        const selectedCategory = await category.findOne({ _id: Category });
        console.log(selectedCategory, "my categ");


        for (let i = 0; i < arrImages.length; i++) {
            await sharp('public/assets/images/productImg/productImages/' + arrImages[i])
                .resize(500, 500)
                .toFile('public/assets/images/productImg/sharpedImg/' + arrImages[i]);
        }

        if (parseInt(Quantity) > 0 && parseFloat(Price) > 0) {
            const Product = new product({
                name: productName,
                price: parseFloat(Price),
                category: selectedCategory._id,
                description: productDescription,
                stock: parseInt(Quantity),
                images: arrImages
            });
            const savedProduct = await Product.save();
        }
        res.redirect('/admin/product');

    } catch (error) {
        console.log('Error:', error);
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
        console.log(error);
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
        console.log(error);

    }
}

const editProduct = async (req, res) => {
    try {
        const { id, productName, productDescription, Price, Category, Quantity } = req.body
        const existingProduct = await product.findById(id);
        const categories = await category.find({ isListed: true });

        let imageData = [];

        if (req.files) {
            const allowedImageFormats = ['image/jpeg', 'image/png'];

            if (existingProduct.images.length + req.files.length !== 3 || req.files.some(file => !allowedImageFormats.includes(file.mimetype))) {
                req.flash("message", "Please upload 3 images of JPEG or PNG format");
                return res.redirect(`/admin/editProduct?productId=${id}`);
            }

           
            imageData = await Promise.all(req.files.map(async (file) => {
                const resizedPath = path.join(__dirname, "../public/assets/images/productImg/sharpedImg", file.filename);
                await sharp(file.path).resize(500, 500, { fit: "fill" }).toFile(resizedPath);
                return file.filename;
            }));
        }


        console.log("hi",req.files);
        console.log("fidu",imageData);

        const selectedCategory = await category.findOne({ _id: Category, isListed: true });

        const updatedProduct = await product.findByIdAndUpdate(
            id,
            {
                name: productName,
                description: productDescription,
                price: Price,
                category: selectedCategory._id,
                stock: Quantity,
                $push: { images: { $each: imageData } },
            },
            { new: true }
        );

        res.redirect("/admin/product");

    } catch (error) {
        console.log(error);

    }
}

const deleteImg = async (req, res) => {
    try {
      const { image, prdtId } = req.body;
      console.log(req.body,"hi");
  
      fs.unlink(path.join(__dirname, "../public/assets/images/productImg/sharpedImg/", image), () => { });
  
      await product.updateOne({ _id: prdtId }, { $pull: { image } });
  
      res.send({ success: true });
    } catch (error) {
      res.redirect('/500')
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