function changeStatus(select) {
    let orderId = select.dataset.orderid;
    let productId = select.dataset.productid;
    let status = select.value;
    let userId = select.dataset.userid;
    const data = {
        orderId,
        productId,
        status,
        userId
    };

    console.log(data);

    fetch('/admin/changeOrderStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => {
        if (response.change === true) {
            document.querySelector('#ReloadTable').innerHTML = '';
            fetch(`/admin/singleOrderDetails?orderId=${orderId} #ReloadTable`)
            .then(response => response.text())
            .then(html => {
                document.querySelector('#ReloadTable').innerHTML = html;
            })
            .catch(error => console.error('Error loading order details:', error));
        }
    })
    .catch(error => console.error('Error changing order status:', error));
}



moment(order.expectedDelivery, 'MMM DD, YYYY' ).format('DD/MM/YYYY')
