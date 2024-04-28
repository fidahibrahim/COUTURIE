const orderModel = require("../models/orderModel");

const loadSalesReport = async (req, res) => {
    try {
        res.render('salesReport')
    } catch (error) {
        res.redirect('/500')
    }
}



const customDateSort = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body
        console.log(req.body, "body");
        const startDate = new Date(fromDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(toDate)
        endDate.setHours(23, 59, 59, 999)

        const customReport = await orderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            { $unwind: "$products" },
            { $match: { 'products.status': { $nin: ['cancelled', 'pending', 'returned', 'shipped'] } } },
            {
                $project: {
                    day: { $dayOfMonth: '$createdAt' },
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' },
                    totalAmount: 1,
                    discount: 1,
                    'products.quantity': 1,
                }
            },
            {
                $group: {
                    _id: {
                        orderId: '$_id',
                        day: '$day',
                        month: '$month',
                        year: '$year'
                    },
                    totalSales: { $first: '$totalAmount' },
                    productsCount: { $sum: '$products.quantity' },
                    couponAmount: { $first: '$discount' }
                }
            },
            {
                $group: {
                    _id: {
                        day: '$_id.day',
                        month: '$_id.month',
                        year: '$_id.year'
                    },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: '$totalSales' },
                    totalProducts: { $sum: '$productsCount' },
                    couponUsed: { $sum: '$couponAmount' }

                }
            },
            {
                $project: {
                    dateFormatted: {
                        $concat: [
                            { $toString: '$_id.year' }, '-',
                            { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }, "-",
                            { $cond: [{ $lt: ['$_id.day', 10] }, { $concat: ['0', { $toString: '$_id.day' }] }, { $toString: '$_id.day' }] }

                        ]
                    },
                    totalSales: 1,
                    totalProducts: 1,
                    couponUsed: 1,
                    totalOrderCount: 1
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }

        ]);
        console.log("custom", customReport);

        res.render('salesReport', {
            data: customReport,
            page: 'customDate',
            totalAmount: customReport.reduce((acc, curr) => acc + curr.totalSales, 0),
            totalSalesCount: customReport.reduce((acc, curr) => acc + curr.totalOrderCount, 0),
            totalCouponAmount: customReport.reduce((acc, curr) => acc + curr.couponUsed, 0),
            fromDate, toDate
        });



    } catch (error) {
        res.redirect('/500')
    }
}


const dailySalesReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const startOfCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endOfCurrentDate = new Date(startOfCurrentDate);
        endOfCurrentDate.setDate(endOfCurrentDate.getDate() + 1);

        const dailyReport = await orderModel.aggregate([
            { $match: { createdAt: { $gte: startOfCurrentDate, $lt: endOfCurrentDate } } }, 
            { $unwind: "$products" },
            { $match: { 'products.status': { $nin: ['cancelled', 'pending', 'returned', 'shipped'] } } },
            {
                $project: {
                    day: { $dayOfMonth: '$createdAt' },
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' },
                    totalAmount: 1,
                    discount: 1,
                    'products.quantity': 1,
                }
            },
            {
                $group: {
                    _id: {
                        orderId: '$_id',
                        day: '$day',
                        month: '$month',
                        year: '$year'
                    },
                    totalSales: { $first: '$totalAmount' },
                    productsCount: { $sum: '$products.quantity' },
                    couponAmount: { $first: '$discount' }
                }
            },
            {
                $group: {
                    _id: {
                        day: '$_id.day',
                        month: '$_id.month',
                        year: '$_id.year'
                    },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: '$totalSales' },
                    totalProducts: { $sum: '$productsCount' },
                    couponUsed: { $sum: '$couponAmount' }

                }
            },
            {
                $project: {
                    dateFormatted: {
                        $concat: [
                            { $toString: '$_id.year' }, '-',
                            { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] }, "-",
                            { $cond: [{ $lt: ['$_id.day', 10] }, { $concat: ['0', { $toString: '$_id.day' }] }, { $toString: '$_id.day' }] }

                        ]
                    },
                    totalSales: 1,
                    totalProducts: 1,
                    couponUsed: 1,
                    totalOrderCount: 1
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.render('salesReport', {
            data: dailyReport,
            page: 'daily',
            totalAmount: dailyReport.reduce((acc, curr) => acc + curr.totalSales, 0),
            totalSalesCount: dailyReport.reduce((acc, curr) => acc + curr.totalOrderCount, 0),
            totalCouponAmount: dailyReport.reduce((acc, curr) => acc + curr.couponUsed, 0),
            fromDate: '',
            toDate: ''
        });


       

    } catch (error) {
        res.redirect('/500')
    }
}

const weeklySalesReport = async(req,res)=>{
    try {
        const sevenWeeksAgo = new Date( new Date().setDate( new Date().getDate() - 49))

        const weeklyReport = await orderModel.aggregate([
            { $match:{ createdAt: { $gte:sevenWeeksAgo } } },
            { $unwind:"$products" },
            { $match:{ 'products.status' :{ $nin:[ 'cancelled','pending','returned','shipped' ] } } },
            {
                $project:{
                    week : { $isoWeek:'$createdAt' },
                    year : { $isoWeekYear:'$createdAt' },
                    totalAmount : 1,
                    discount : 1,
                    orderItemQuantity : '$products.quantity',

                }
            },
            {
                $group:{
                    _id:{ week:'$week', year:'$year', orderId:'$_id' },
                    totalAmount:{ $first:'$totalAmount' },
                    couponAmount:{ $first:'$discount' },
                    productsCount:{ $sum:'$orderItemQuantity' },
                }
            },
            {
                $group:{
                    _id: { week: "$_id.week", year: "$_id.year" },
                    totalOrderCount:{ $sum:1 },
                    totalSales:{ $sum:'$totalAmount' },
                    totalProducts:{ $sum:'$productsCount' },
                    couponUsed:{ $sum:'$couponAmount' }
                }
            },
            {
                $project : {
                    _id:0,
                    week:'$_id.week',
                    year:'$_id.year',
                    totalOrderCount:1,
                    totalSales:1,
                    totalProducts:1,
                    couponUsed:1,
                    startOfWeek: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 1 } } } },
                    endOfWeek: { $dateToString: { format: "%Y-%m-%d", date: { $dateFromParts: { isoWeekYear: "$_id.year", isoWeek: "$_id.week", isoDayOfWeek: 7 } } } }

                }
            },
            {
                $sort:{ 'year':1, 'week':1 }
            }
        ]);

        console.log("weekly",weeklyReport);

        res.render('salesReport',{
            data: weeklyReport, page: 'weekly',
            totalAmount: weeklyReport.reduce((acc, curr) => acc + curr.totalSales, 0),
            totalSalesCount: weeklyReport.reduce((acc, curr) => acc + curr.totalOrderCount, 0),
            totalCouponAmount: weeklyReport.reduce((acc, curr) => acc + curr.couponUsed, 0),
            fromDate:'', toDate:''
        })
    } catch (error) {
        res.redirect('/500')
    }
}


const monthlySalesReport = async (req,res)=>{
    try {
        const twelveMonthsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

        const monthlyReport = await orderModel.aggregate([
            { $match:{ createdAt: { $gte:twelveMonthsAgo } } },
            { $unwind:'$products' },
            { $match:{ 'products.status' : { $nin: [ "cancelled", "pending", "returned","shipped" ] } } },
            {
                $project:{
                    month:{ $month:'$createdAt' },
                    year:{ $isoWeekYear:'$createdAt' },
                    totalAmount: 1,
                    discount: 1,
                    orderItemQuantity:'$products.quantity',
                }
            },
            {
                $group:{
                    _id:{ month:'$month', year:'$year', orderId:'$_id' },
                    totalAmount:{ $first:'$totalAmount' },
                    couponAmount:{ $first:'$discount' },
                    totalProducts:{ $sum:'$orderItemQuantity' },

                }
            },
            {
                $group: {
                    _id: { month: "$_id.month", year: "$_id.year" },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" },
                    totalProducts: { $sum: "$totalProducts" },
                    couponsUsed: { $sum: "$couponAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    totalOrderCount: 1,
                    totalSales: 1,
                    totalProducts: 1,
                    couponsUsed: 1,
                    monthName: {
                        $arrayElemAt: [
                            ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                            { $subtract: ["$_id.month", 1] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    monthYear: { $concat: ["$monthName", "-", { $toString: "$year" }] }
                }
            },
            { $sort: { "year": 1, "month": 1 } }
        ])

        console.log("monthly",monthlyReport);

        res.render('salesReport',{
            data: monthlyReport,
            page: 'monthly',
            totalAmount: monthlyReport.reduce((acc, curr) => acc + curr.totalSales, 0),
            totalSalesCount: monthlyReport.reduce((acc, curr) => acc + curr.totalOrderCount, 0),
            totalCouponAmount: monthlyReport.reduce((acc, curr) => acc + curr.couponsUsed, 0),
            fromDate:'', toDate:''
        })
    } catch (error) {
       res.redirect('/500') 
    }
}



const YearlySalesReport = async (req,res)=>{
    try {
        const yearlyReport = await orderModel.aggregate([
            { $unwind:'$products' },
            { $match:{ 'products.status':{ $nin:[ "cancelled", "pending", "returned" ] } } },
            {
                $project: {
                    year: { $isoWeekYear: "$createdAt" },
                    totalAmount: 1,
                    discount: 1,
                    orderedItemQuantity: "$products.quantity",
                }
            },
            {
                $group: {
                    _id: { year: "$year", orderId: "$_id" },
                    totalAmount: { $first: "$totalAmount" },
                    couponAmount: { $first: "$discount" },
                    totalProducts: { $sum: "$orderedItemQuantity" },
                }
            },
            {
                $group: {
                    _id: { year: "$_id.year" },
                    totalOrderCount: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" },
                    totalProducts: { $sum: "$totalProducts" },
                    couponsUsed: { $sum: "$couponAmount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    totalOrderCount: 1,
                    totalSales: 1,
                    totalProducts: 1,
                    offeredProductsSold: 1,
                    couponsUsed: 1
                }
            },
            { $sort: { "year": 1 } }
        ]);
        console.log("yearlyReport", yearlyReport);
        res.render('salesReport', {
            data: yearlyReport,
            page: 'yearly',
            totalAmount: yearlyReport.reduce((acc, curr) => acc + curr.totalSales, 0),
            totalSalesCount: yearlyReport.reduce((acc, curr) => acc + curr.totalOrderCount, 0),
            totalCouponAmount: yearlyReport.reduce((acc, curr) => acc + curr.couponsUsed, 0),
            fromDate:'', toDate:''
        });
    } catch (error) {
        res.redirect('/500')
    }
}









module.exports = {
    loadSalesReport,
    customDateSort,
    dailySalesReport,
    weeklySalesReport,
    monthlySalesReport,
    YearlySalesReport
}