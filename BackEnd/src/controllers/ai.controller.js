const { generateStructuredReview } = require("../services/ai.service.ts");

module.exports.getReview = async (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).send("Prompt is required");
    }

    try {
        const response = await generateStructuredReview({ code });
        res.send(response);
    } catch (error) {
        console.error("AI review error:", error.message || error);
        res.status(500).json({
            error: "Failed to generate code review",
            details: error.message || "An unexpected error occurred while communicating with the AI service"
        });
    }
}