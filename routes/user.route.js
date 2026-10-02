import { Router } from "express";

import {
  forgotPasswordController,
  registerUserController,
  verifyUserController,
  verifyOtpPasswordController,
  loginUserController,
  logoutUseController,
  changePasswordController,
  resendOtpController,
  authWithGoogle,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post("/verify/email", verifyUserController);
userRouter.post("/login", loginUserController);
userRouter.get("/logout", logoutUseController);
userRouter.post("/forget/password", forgotPasswordController);
userRouter.post("/forgot/password/otp", verifyOtpPasswordController);
userRouter.post("/password/change", changePasswordController);
userRouter.post("/resend/otp", resendOtpController);
userRouter.post("/auth/with/google", authWithGoogle);

export default userRouter;
