import jwt from "jsonwebtoken";

const generateAccessToken = (userID) => {
  const token = jwt.sign(
    {
      id: userID,
    },
    process.env.SECRET_KEY_ACCESS_TOKEN,
    {
      expiresIn: "24h",
    },
  );

  return token;
};

export default generateAccessToken;
