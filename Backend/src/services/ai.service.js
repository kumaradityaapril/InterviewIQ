const {GoogleGenAI} = require("@google/genai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
})


async function invokeGeminiAi(){
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents:"Hello gemini ! Explain what is Interview?"
        })
        console.log(response.text)
    } catch (error) {
        console.error("Gemini AI invocation failed:", error.message || error)
    }
}

async function generateInterviewReport({ resume,selfdescription,jobdescription }){

    
}

module.exports = invokeGeminiAi