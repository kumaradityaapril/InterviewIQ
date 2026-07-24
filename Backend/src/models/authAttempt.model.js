const mongoose = require("mongoose");

const authAttemptSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true // 'ip:127.0.0.1' or 'account:user@example.com'
    },
    failures: {
        type: Number,
        default: 0
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("authAttempts", authAttemptSchema);
