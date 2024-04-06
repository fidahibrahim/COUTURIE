<div class="container-fluid">

<div class="container">
    <!-- Title -->
    <div class="d-flex justify-content-between align-items-center py-5">
        <h2 class="h5 mb-0"><a href="#" class="text-muted"></a> Order #OJOO
        </h2>
    </div>

    <!-- Main content -->
    <div class="row">
        <div class="col-lg-8">
            <!-- Details -->
            <div class="card mb-4">
                <div class="card-body p-5">
                    <div class="mb-0 d-flex justify-content-between">
                        <div>


                            <div class="warning-message"
                                style="background-color: #ffe6e6; color: #990000; padding: 10px; border-radius: 5px;">

                                <p>The payment for this order has been failed, please <button
                                        class="btn-link" type="button" onclick="" id="continuePayment">click
                                        here</button> to pay now.</p>

                            </div>

                            <span class="me-3">Estimated Delivery By: <strong><span
                                        style="color:black;">ll, 11PM</span></strong></span>

                        </div>
                    </div>
                    <table class="table table-borderless">
                        <tbody>

                            <tr id="">
                                <td>
                                    <div class="d-flex mb-0">
                                        <div class="flex-shrink-0">

                                        </div>
                                        <div class="flex-lg-grow-1 ms-3">
                                            <h6 class="small mb-1"><a href="#"
                                                    class="text-reset"><strong></strong></a></h6>
                                            <span class="small">Quantity: </span><br>
                                            <span class="small">Price: ₹ml</span>
                                            <span class="badge rounded-pill text-white">
                                                <!-- Add content for the badge -->
                                            </span>
                                            <br>
                                            <a href="#" class="cancel-link" data-product-id=""
                                                data-index="">
                                                Cancel Item
                                            </a>
                                            <br>
                                            <a href="#" class="return-link" data-product-id=""
                                                data-index="">
                                                Return Item
                                            </a>

                                        </div>
                                    </div>
                                </td>
                                <td>ll</td>
                                <td class="text-end">₹kk</td>
                            </tr>

                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2">Subtotal</td>
                                <td class="text-end">₹ojl</td>
                            </tr>
                            <tr>
                                <td colspan="2">Shipping</td>
                                <td class="text-end">₹00.00</td>
                            </tr>
                            <tr>
                                <td colspan="2">Coupon Discount</td>
                                <td class="text-danger text-end">-₹lml</td>
                            </tr>
                            <tr class="fw-bold">
                                <td colspan="2">GRAND TOTAL</td>
                                <td class="text-end" id="grandTotal">₹ljll</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>
        <div class="col-lg-4">
            <!-- Customer Notes -->
            <div class="card mb-4 p-3">
                <div class="card-body ">

                    <h3 class="h6">Payment Details</h3>

                    <strong>Payment ID: </strong>jhjh</p>

                </div>
            </div>
            <div class="card mb-4 p-3">
                <!-- Shipping information -->
                <div class="card-body">

                    <!-- <h3 class="h6">Shipping Information</h3>
  <strong>FedEx</strong>
  <span><a href="#" class="text-decoration-underline" target="_blank">FF1234567890</a> <i class="bi bi-box-arrow-up-right"></i> </span>
  <hr> -->
                    <h3 class="h6">Shipping Address</h3>
                    <address>
                        <strong>jb</strong><br>
                        kn<br>
                        nmmm, kkm<br>
                        Pincode: jk<br>
                        Mobile: +91-kjkj %>
                    </address>
                </div>
            </div>
        </div>
    </div>
</div>
</div>

<!--Cancel Confirmation Modal -->
<div class="modal fade" id="cancelConfirmationModal" tabindex="-1"
aria-labelledby="cancelConfirmationModalLabel" aria-hidden="true">
<!-- Modal content -->
<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="cancelConfirmationModalLabel">Confirm Cancellation</h5>
        </div>
        <div class="modal-body">
            <!-- Form for cancellation reason -->
            <form id="cancelReasonForm">
                <div class="container-fluid mb-3 p-4">
                    <label for="reason" class="form-label">Reason for Cancellation:</label>
                    <select class="form-select" id="reason" name="reason" required>
                        <!-- Options for cancellation reasons -->
                        <option value="">Select a reason</option>
                        <option value="Item no longer needed">Item no longer needed</option>
                        <option value="Found a better price elsewhere">Found a better price elsewhere
                        </option>
                        <option value="Changed my mind">Changed my mind</option>
                        <option value="Delivery date is too long">Delivery date is too long</option>
                        <!-- Add more options as needed -->
                    </select>
                </div>
                <!-- Buttons -->
                <div class="d-flex justify-content-end">
                    <!-- Close button -->
                    <button type="button" class="btn btn-secondary me-2"
                        data-bs-dismiss="modal">Close</button>
                    <!-- Confirm Cancellation button -->
                    <button type="submit" class="btn btn-primary">Confirm Cancellation</button>
                </div>
            </form>
        </div>
    </div>
</div>
</div>


<!-- Modal -->
<div class="modal fade" id="returnModal" tabindex="-1" role="dialog" aria-labelledby="returnModalLabel"
aria-hidden="true">
<div class="modal-dialog" role="document">
    <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="returnModalLabel">Select Reason for Return</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <!-- Add your form elements for selecting the reason for return here -->
            <form>
                <div class="form-group">
                    <label for="returnReason">Reason</label>
                    <select class="form-control" id="returnReason">
                        <option>Select Reason</option>
                        <option>Defective Product</option>
                        <option>Wrong Item Received</option>
                        <option>Changed Mind</option>
                        <!-- Add more options as needed -->
                    </select>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="submitReturn()">Submit</button>
        </div>
    </div>
</div>
</div>