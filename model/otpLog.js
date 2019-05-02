const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpLogSchema = new Schema({
    type: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    number: String,
    otp: Number,
    subject: String,
    status: Number,
    created_at:{type:Date,default:Date.now}
})

const OtpLog = mongoose.model('OtpLog', otpLogSchema);
module.exports = OtpLog;