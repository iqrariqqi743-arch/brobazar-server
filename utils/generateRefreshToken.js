import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserModel from "../models/users.model.js";

dotenv.config();

const generateRefreshToken = async (userID) => {
  const token = jwt.sign(
    {
      id: userID,
    },
    process.env.SECRET_KEY_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    },
  );

  const updateRefreshToken = await UserModel.updateOne(
    { _id: userID },
    {
      refresh_token: token,
    },
  );

  return token;
};

export default generateRefreshToken;
