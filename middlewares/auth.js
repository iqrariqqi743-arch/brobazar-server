import jwt from "jsonwebtoken";
const Auth = async (request, response, next) => {
  try {
    const token =
      request.cookies?.accessToken ||
      request.headers?.authorization?.split(" ")[1];
    if (!token) {
      return response
        .status(401)
        .json({ message: "Authentication token is required" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    request.userId = decoded.id;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
};
export default Auth;
