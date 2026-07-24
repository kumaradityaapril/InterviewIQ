const multer = require("multer");

const limits = {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || "3145728") // 3MB default
};

const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            const err = new Error("Only PDF files are allowed.");
            err.statusCode = 400;
            return cb(err, false);
        }
        cb(null, true);
    }
}).single("resume");

// Wrapper middleware enforcing isolated memory uploads and content magic signatures
const uploadMiddleware = (req, res, next) => {
    multerInstance(req, res, (err) => {
        if (err) {
            console.error("Multer upload error:", err);
            const status = err.statusCode || 400;
            return res.status(status).json({
                message: err.message || "Failed to upload file due to size or format limits."
            });
        }

        // Verify that a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required." });
        }

        // Verify content signature (Magic bytes check: PDF must start with '%PDF')
        const fileBuffer = req.file.buffer;
        if (!fileBuffer || fileBuffer.length < 4 || fileBuffer.toString("utf-8", 0, 4) !== "%PDF") {
            return res.status(400).json({
                message: "Invalid file content. Uploaded file is not a valid PDF document."
            });
        }

        next();
    });
};

module.exports = uploadMiddleware;