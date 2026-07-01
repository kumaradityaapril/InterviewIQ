const mongoose = require('mongoose')

const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required:[true,"token is required"]
    }
},{
    timestamps: true
})

const tokenBlackListModel = mongoose.model("blackListTokens",blackListTokenSchema)

module.exports = tokenBlackListModel