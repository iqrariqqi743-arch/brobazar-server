import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFunction from "../config/sendEmail.js";
import VerifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import userModel from "../models/users.model.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

export async function registerUserController(request, response) {
  try {
    const { name, email, password } = request.body;

    if (!name?.trim()) {
      return response.status(400).json({
        message: "Name is required",
        error: true,
        success: false,
      });
    }

    if (!email?.trim()) {
      return response.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    if (!password?.trim()) {
      return response.status(400).json({
        message: "Password is required",
        error: true,
        success: false,
      });
    }

    const existingUser = await userModel.findOne({
      email: email,
    });

    if (existingUser) {
      return response.status(400).json({
        message: "Email already exists",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000);

    const salt = await bcryptjs.genSalt(10);

    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = new userModel({
      email: email,
      name: name,
      otp: verifyCode,
      password: hashedPassword,
      verify_email: false,
      otp_expiry: new Date(Date.now() + 10 * 60 * 1000),
    });

    await user.save();

    await sendEmailFunction({
      sendTo: email,
      subject: "Verify Email From BroBazar",
      text: `Your verification OTP is ${verifyCode}`,
      html: VerifyEmailTemplate(name, verifyCode),
    });

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET,
    );

    return response.status(200).json({
      error: false,
      success: true,
      message: "User Register successfully! Please verify your email",
      token: token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyUserController(request, response) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "please Provide email and opt",
      });
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return response.status(400).json({
        message: "User Not Found",
        error: true,
        success: false,
      });
    }

    const isCodeValid = user.otp === otp;
    const notExpired = user.otp_expiry > Date.now();

    if (isCodeValid && notExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otp_expiry = null;
      await user.save();

      return response.status(200).json({
        message: "Your email is verify successfully!",
        error: false,
        success: true,
      });
    } else if (!isCodeValid) {
      return response.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    } else {
      return response.status(400).json({
        message: "Your Is OTP Expired ",
        error: true,
        success: false,
      });
    }
  } catch (error) {
    console.error("Register error:", error);

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function loginUserController(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      });
    }

    // IMPORTANT: await is required here
    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      return response.status(400).json({
        message: "User not Available",
        error: true,
        success: false,
      });
    }

    if (user.status !== "active") {
      return response.status(400).json({
        message: "Please contact with admin, your account is not active",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return response.status(400).json({
        message: "Please verify your email first then try to login",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return response.status(400).json({
        message:
          "Check your password, please provide the correct password for login",
        error: true,
        success: false,
      });
    }

    const accessToken = generateAccessToken(user._id);

    const refreshToken = await generateRefreshToken(user._id);

    await userModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.cookie("accessToken", accessToken, cookieOption);
    response.cookie("refreshToken", refreshToken, cookieOption);

    return response.status(200).json({
      message: "User Login Successfully! :)",
      cookieOption: cookieOption,
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          email: user?.email,
          name: user?.name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function logoutUseController(request, response) {
  try {
    const userId = request?.userId;

    const cookieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    response.clearCookie("accessToken", cookieOption);
    response.clearCookie("refreshToken", cookieOption);

    const removeRefreshToken = await userModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return response.json({
      message: "User logout successfully ! :)",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return response.status(500).json({
        message: "User Not Available!",
        error: true,
        success: false,
      });
    } else {
      const verifyCode = Math.floor(100000 + Math.random() * 900000);
      user.otp = verifyCode;
      user.otp_expiry = Date.now() + 10 * 60 * 1000;

      await user.save();

      await sendEmailFunction({
        sendTo: email,
        subject: "Verify Email From BroBazar",
        text: `Your verification OTP is ${verifyCode}`,
        html: VerifyEmailTemplate(user.email, verifyCode),
      });

      return response.json({
        message: "Check your email ",
        error: false,
        success: true,
      });
    }
  } catch (error) {
    console.error("Register error:", error);

    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyOtpPasswordController(request, response) {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return response.status(400).json({
        message: "Please provide your email and OTP",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      return response.status(404).json({
        message: "User not found with this email",
        error: true,
        success: false,
      });
    }

    if (String(otp) !== String(user.otp)) {
      return response.status(400).json({
        message: "Invalid OTP, please provide the correct OTP",
        error: true,
        success: false,
      });
    }

    const currentTimeDate = new Date();

    if (!user.otp_expiry || user.otp_expiry < currentTimeDate) {
      return response.status(400).json({
        message: "Your OTP has expired. Please request a new OTP.",
        error: true,
        success: false,
      });
    }

    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    return response.status(200).json({
      message: "Your OTP has been verified successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function changePasswordController(request, response) {
  try {
    const { email, newPassword, confirmPassword } = request.body;

    if (!email || !newPassword || !confirmPassword) {
      return response.status(400).json({
        message: "Please provide email, new password and confirm password",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({
      email: email,
    });

    if (!user) {
      return response.status(404).json({
        message: "User not available with this email",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "New password and confirm password must be the same",
        error: true,
        success: false,
      });
    }

    if (newPassword.length < 6) {
      return response.status(400).json({
        message: "Password must be at least 6 characters",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);

    const hashPassword = await bcryptjs.hash(newPassword, salt);

    user.password = hashPassword;
    user.sing_up_with_google = false;

    await user.save();

    return response.status(200).json({
      message: "Your password has been changed successfully! :)",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Change password error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function resendOtpController(request, response) {
  try {
    const { email } = request.body;

    if (!email) {
      return response.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return response.status(400).json({
        message: "User not registered with this email",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000);

    user.otp = verifyCode;

    user.otp_expiry = new Date(Date.now() + 2 * 60 * 1000);

    await sendEmailFunction({
      sendTo: email,
      subject: "Verify Email From BroBazar",
      text: `Your verification OTP is ${verifyCode}`,
      html: VerifyEmailTemplate(user?.name, verifyCode),
    });

    await user.save();

    return response.status(200).json({
      message: "OTP resent successfully. Please check your email.",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

export async function authWithGoogle(request, response) {
  const { name, email, password, avatar, mobile, role } = request.body;
  try {
    const existUser = await userModel.findOne({ email: email });

    if (!existUser) {
      const user = await userModel.create({
        name: name,
        email: email,
        mobile: mobile,
        avatar: avatar,
        role: role,
        password: "null",
        verify_email: true,
        sing_up_with_google: true,
      });

      await user.save();

      const accessToken = await generateAccessToken(user?._id);
      const refreshToken = await generateRefreshToken(user?._id);

      await userModel.findByIdAndUpdate(user?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "User login successfully ! :)",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            email: user?.email,
            name: user?.name,
          },
        },
      });
    } else {
      const accessToken = await generateAccessToken(existUser?._id);
      const refreshToken = await generateRefreshToken(existUser?._id);

      await userModel.findByIdAndUpdate(existUser?._id, {
        last_login_date: new Date(),
      });

      const cookiesOption = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      response.cookie("accessToken", accessToken, cookiesOption);
      response.cookie("refreshToken", refreshToken, cookiesOption);

      return response.json({
        message: "User login successfully ! :)",
        error: false,
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            email: existUser?.email,
            name: existUser?.name,
          },
        },
      });
    }
  } catch (error) {
    return response.status(400).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
