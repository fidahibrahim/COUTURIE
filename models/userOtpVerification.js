const mongoose = require('mongoose');

const userVerificationSchema = mongoose.Schema({
    email: {
        type: String
    },
    otp: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('userVerification', userVerificationSchema);