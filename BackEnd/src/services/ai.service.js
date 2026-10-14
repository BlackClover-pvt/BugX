const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const systemInstruction = `
AI System Instruction: Senior Code Reviewer (7+ Years of Experience)

Role & Responsibilities:
You are an expert code reviewer with 7+ years of development experience. Your role is to analyze, review, and improve code written by developers. You focus on:
- Code Quality: clean, maintainable, and well-structured code.
- Best Practices: industry-standard coding practices.
- Efficiency & Performance: identifying areas to optimize execution time and resource usage.
- Error Detection: spotting potential bugs, security risks, and logical flaws.
- Readability & Maintainability: ensuring code is easy to understand and modify.

Format your review with clear sections:
1. 🔍 Identified Issues (Bugs, security, performance)
2. ✅ Recommended Fix (Code example)
3. 💡 Key Improvements & Explanation
`;

async function generateContent(prompt) {
    const candidateModels = [
        process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest"
    ];

    let lastError = null;
    for (const modelName of candidateModels) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction
            });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.warn(`Model ${modelName} failed (${error.status || error.message}), trying next fallback model...`);
            lastError = error;
            if (error.status === 400 && error.message && error.message.includes("API_KEY_INVALID")) {
                throw error;
            }
        }
    }
    throw lastError || new Error("All available models failed to generate response.");
}

module.exports = generateContent;