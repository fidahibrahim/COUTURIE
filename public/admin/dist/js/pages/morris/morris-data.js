// Dashboard 1 Morris-chart
$(function () {
    "use strict";
    // =========================pei chart=====================

    let COD = document.getElementById('cod').value
    let RAZORPAY = document.getElementById('razorpay').value
    let WALLET = document.getElementById('wallet').value




    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Wallet",
            value: WALLET,

        }, {
            label: "COD",
            value: COD
        }, {
            label: "Razor-Pay",
            value: RAZORPAY
        }],
        resize: true,
        colors:['#5f76e8', '#01caf1', '#8fa0f3']
    });

 });    