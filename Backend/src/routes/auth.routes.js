const express = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = express.Router()

authRouter.post("/register", authController.registerUserController)
authRouter.post("/login", authController.loginUserController)
authRouter.post("/google", authController.googleAuthController)

authRouter.get("/logout",authController.logoutUserController)

authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)

authRouter.get("/profile", authMiddleware.authUser, authController.getUserProfileController)
authRouter.put("/profile", authMiddleware.authUser, authController.updateUserProfileController)

module.exports = authRouter