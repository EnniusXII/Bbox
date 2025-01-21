import jwt from "jsonwebtoken";
import User from "../models/UserSchema.mjs";
import { asyncHandler } from "./asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(new ErrorResponse("Not authorized, you need to log in!", 401));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by decoded ID and set to req.user
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse("No user found with this ID", 401));
    }

    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized, invalid token. Please try to log in", 401));
  }
});