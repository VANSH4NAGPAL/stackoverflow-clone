import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No authentication token, authorization denied." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decodedData.id;
    req.userEmail = decodedData.email;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid." });
  }
};

export default auth;