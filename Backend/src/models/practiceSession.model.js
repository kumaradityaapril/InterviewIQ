const mongoose = require('mongoose')

const practiceQuestionSchema = mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ""
    },
    matchedKeywords: [{
        type: String
    }]
}, {
    _id: false
})

const PracticeSessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "interviewReports"
    },
    overallScore: {
        type: Number,
        required: true
    },
    questions: [practiceQuestionSchema]
}, {
    timestamps: true
})

const practiceSessionModel = mongoose.model("practiceSessions", PracticeSessionSchema)

module.exports = practiceSessionModel
