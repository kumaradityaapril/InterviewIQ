const validate = (schema) => (req, res, next) => {
    try {
        // Run parser validation checks
        const parsed = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        if (!parsed.success) {
            // Map validation errors into user-friendly diagnostic logs
            const errors = parsed.error.issues.map(err => ({
                field: err.path.slice(1).join("."),
                message: err.message
            }));
            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        // Reassign request slots with sanitized, parsed content to strip parameters not declared in Zod
        if (parsed.data.body) req.body = parsed.data.body;
        if (parsed.data.query) req.query = parsed.data.query;
        if (parsed.data.params) req.params = parsed.data.params;
        
        next();
    } catch (err) {
        console.error("Zod validation middleware error:", err);
        return res.status(500).json({
            message: "Internal server error during input validation"
        });
    }
};

module.exports = validate;
