const express = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { publicRateLimiter, authLockoutCheck } = require("../middlewares/rateLimiter.middleware")

const authRouter = express.Router()

authRouter.use(publicRateLimiter)

authRouter.post("/register", authLockoutCheck, authController.registerUserController)
authRouter.post("/login", authLockoutCheck, authController.loginUserController)
authRouter.post("/google", authLockoutCheck, authController.googleAuthController)

authRouter.get("/logout",authController.logoutUserController)

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

authRouter.get("/profile", authMiddleware.authUser, authController.getUserProfileController)
authRouter.put("/profile", authMiddleware.authUser, authController.updateUserProfileController)

module.exports = authRouter