import { Router } from "express";

import {
  forgotPasswordController,
  registerAdminUserController,
  verifyAdminUserController,
  verifyOtpPasswordController,
  loginAdminUserController,
  logoutAdminUserController,
  changePasswordController,
  resendOtpController,
  authWithGoogle,
} from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.post("/register", registerAdminUserController);
adminRouter.post("/verify/email", verifyAdminUserController);
adminRouter.post("/login", loginAdminUserController);
adminRouter.get("/logout", logoutAdminUserController);
adminRouter.post("/forget/password", forgotPasswordController);
adminRouter.post("/forgot/password/otp", verifyOtpPasswordController);
adminRouter.post("/password/change", changePasswordController);
adminRouter.post("/resend/otp", resendOtpController);
adminRouter.post("/auth/with/google", authWithGoogle);

export default adminRouter;
