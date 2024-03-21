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
    },
    expirationTime: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 1 * 60 * 1000)
        }
    }
});

userVerificationSchema.methods.isExpired = function(){
    return this.expirationTime <= new Date();
}

module.exports = mongoose.model('userVerification', userVerificationSchema);