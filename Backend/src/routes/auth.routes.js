const express = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { publicRateLimiter, authLockoutCheck } = require("../middlewares/rateLimiter.middleware")
const validate = require("../middlewares/validate.middleware")
const { registerSchema, loginSchema, googleLoginSchema, updateProfileSchema } = require("../validation/schemas")

const authRouter = express.Router()

authRouter.use(publicRateLimiter)

authRouter.post("/register", validate(registerSchema), authLockoutCheck, authController.registerUserController)
authRouter.post("/login", validate(loginSchema), authLockoutCheck, authController.loginUserController)
authRouter.post("/google", validate(googleLoginSchema), authLockoutCheck, authController.googleAuthController)

authRouter.get("/logout",authController.logoutUserController)

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

authRouter.get("/profile", authMiddleware.authUser, authController.getUserProfileController)
authRouter.put("/profile", authMiddleware.authUser, validate(updateProfileSchema), authController.updateUserProfileController)

module.exports = authRouter