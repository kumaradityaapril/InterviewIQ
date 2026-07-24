const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklist.model")
const interviewReportModel = require("../models/interviewReport.model")
const practiceSessionModel = require("../models/practiceSession.model")
const { recordAuthFailure, recordAuthSuccess } = require("../middlewares/rateLimiter.middleware")

async function registerUserController(req,res){
    try {
        const {username,email,password} = req.body

        if(!username || !email || !password) {
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{username},{email}]
        })

        if(isUserAlreadyExists) { 
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            })
        }

        const hash = await bcrypt.hash(password,10)

        const user = await userModel.create({
            username,
            email,
            password:hash
        })

        const token = jwt.sign(
            {id : user._id,username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )

        res.cookie("token",token)

        await recordAuthSuccess(req.ip, email);

        res.status(201).json({
            message:"User Registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
        })
    } catch (error) {
        await recordAuthFailure(req.ip, req.body.email);
        console.error("Register user error:", error)
        res.status(500).json({
            message: "Registration failed due to a server error. Please try again later."
        })
    }
}

async function loginUserController(req,res) {
    try {
        const {email,password} = req.body

        if(!email || !password) {
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email })

        if(!user) {
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password,user.password)

        if(!isPasswordValid) {
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            {id : user._id,username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )

        res.cookie("token",token)
        await recordAuthSuccess(req.ip, email);

        res.status(200).json({
            message:"User loggedIn successfully.",
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        }) 
    } catch (error) {
        await recordAuthFailure(req.ip, req.body.email);
        console.error("Login user error:", error)
        res.status(500).json({
            message: "Login failed due to a server error. Please try again later."
        })
    }
}

async function logoutUserController(req,res) {
    const token = req.cookies.token

    if(token){
        await tokenBlackListModel.create({token})
    } 

    res.clearCookie("token")

    res.status(200).json({
        message:"User Logged out successfully"
    })
}

async function getMeController(req,res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message : "User detail fetched successfully",
        user: {
            id : user._id,
            username: user.username,
            email: user.email

        }
    })
}

async function googleAuthController(req, res) {
    try {
        const { token } = req.body;
        if (!token) {
            await recordAuthFailure(req.ip, req.body.email);
            return res.status(400).json({ message: "Google credential token is required." });
        }

        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!response.ok) {
            await recordAuthFailure(req.ip, req.body.email);
            return res.status(400).json({ message: "Invalid Google credential token." });
        }

        const payload = await response.json();
        const { sub, email, name, email_verified } = payload;

        if (!email_verified) {
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({ message: "Google email is not verified." });
        }

        const client_id = process.env.GOOGLE_CLIENT_ID;
        if (client_id && payload.aud !== client_id) {
            console.warn(`Token client ID mismatch. Expected: ${client_id}, Found: ${payload.aud}`);
            await recordAuthFailure(req.ip, email);
            return res.status(400).json({ message: "Unauthorized: Client ID mismatch." });
        }

        let user = await userModel.findOne({
            $or: [{ googleId: sub }, { email }]
        });

        if (!user) {
            let cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            let username = cleanName + Math.floor(100 + Math.random() * 900);
            
            let existingUsername = await userModel.findOne({ username });
            while (existingUsername) {
                username = cleanName + Math.floor(100 + Math.random() * 900);
                existingUsername = await userModel.findOne({ username });
            }

            const randPass = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randPass, 10);

            user = await userModel.create({
                username,
                email,
                password: hashedPassword,
                googleId: sub
            });
        } else {
            if (!user.googleId) {
                user.googleId = sub;
                await user.save();
            }
        }

        const jwtToken = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", jwtToken);
        await recordAuthSuccess(req.ip, user.email);

        res.status(200).json({
            message: "User logged in successfully via Google",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        await recordAuthFailure(req.ip, req.body.email);
        console.error("Google Authentication error:", error);
        res.status(500).json({
            message: "Failed to authenticate via Google due to a server error."
        });
    }
}

async function getUserProfileController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Aggregate statistics
        const totalReports = await interviewReportModel.countDocuments({ user: req.user.id });
        const practiceSessions = await practiceSessionModel.find({ user: req.user.id });
        const totalPracticeSessions = practiceSessions.length;

        // Calculate average practice score
        let averagePracticeScore = 0;
        if (totalPracticeSessions > 0) {
            const sum = practiceSessions.reduce((acc, sess) => {
                return acc + (sess.overallScore || 0);
            }, 0);
            averagePracticeScore = Math.round(sum / totalPracticeSessions);
        }

        res.status(200).json({
            message: "Profile details fetched successfully",
            profile: {
                username: user.username,
                email: user.email,
                isGoogleUser: !!user.googleId,
                stats: {
                    totalReports,
                    totalPracticeSessions,
                    averagePracticeScore
                }
            }
        });
    } catch (error) {
        console.error("Error in getUserProfileController:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function updateUserProfileController(req, res) {
    try {
        const { username, password } = req.body;
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) {
            // Check if username is already taken by someone else
            const existing = await userModel.findOne({ username, _id: { $ne: user._id } });
            if (existing) {
                return res.status(400).json({ message: "Full Name already taken" });
            }
            user.username = username;
        }

        if (password && !user.googleId) {
            // Hash and update password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error in updateUserProfileController:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    googleAuthController,
    getUserProfileController,
    updateUserProfileController
}
