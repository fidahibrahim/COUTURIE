const category = require('../models/category');

const loadCategory = async (req, res) => {
    try {
        let page = 1;
        if (req.query.id) {
            page = req.query.id
        }

        const limit = 5;
        let Next = page + 1;
        let Previous = page > 1 ? page - 1 : 1

        const count = await category.find().count()

        const totalPages = Math.ceil(count / limit)

        if (Next > totalPages) {
            Next = totalPages
        }


        const categoryData = await category.find({})
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .exec()


        res.render('category', {
            category: categoryData,
            page: page,
            Previous: Previous,
            Next: Next,
            totalPages: totalPages,
            currentPage: page,
            pageSize: limit
        });

    } catch (error) {
        res.redirect('/500')

    }
}

const loadAddCatogery = async (req, res) => {
    try {

        res.render('addCategory');

    } catch (error) {
        res.redirect('/500')
    }
}

const addCategory = async (req, res) => {
    try {
        const categoryName = req.body.CategoryName.toUpperCase()
        const existCategory = await category.findOne({
            name: categoryName,
        });
        if (existCategory) {
            req.flash('message', 'Category already exist');
            res.redirect('/admin/addCategory');
        } else {
            const { CategoryName, CategoryDescription } = req.body;

            const newCategory = new category({
                name: CategoryName.toUpperCase(),
                description: CategoryDescription
            });

            await newCategory.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        res.redirect('/500')
    }
};


const categoryStatus = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryData = await category.findById(categoryId);
        if (!categoryData) {
            return res.status(404).json({ error: "Category not found" });
        }

        const updatedCategory = await category.findByIdAndUpdate(
            categoryId,
            { $set: { isListed: !categoryData.isListed } },
            { new: true }
        );

        res.send({ status: "success", category: updatedCategory });

    } catch (error) {
        res.redirect('/500')
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.categoryId
        const data = await category.findOne({ _id: id });

        if (!data) {
            return res.status(404).send("Category not found");
        }

        res.render('editCategory', { categories: data });

    } catch (error) {
        res.redirect('/500')
    }
}

const editCategory = async (req, res) => {

    try {
        const existingCategory = await category.findOne({
            name: req.body.CategoryName.toUpperCase(),
        });

        if (existingCategory && existingCategory._id.toString() !== req.body.id) {
            return res.render('editCategory', {
                message: "Category with this name already exists",
                categories: { _id: req.body.id, name: req.body.CategoryName, description: req.body.CategoryDescription },
            });
        }

        await category.findByIdAndUpdate(
            { _id: req.body.id },
            {
                name: req.body.CategoryName.toUpperCase(),
                description: req.body.CategoryDescription,
            }
        )
        res.redirect("/admin/category");

    } catch (error) {
        res.redirect('/500')
    }

}



module.exports = {
    loadCategory,
    loadAddCatogery,
    addCategory,
    categoryStatus,
    loadEditCategory,
    editCategory
}