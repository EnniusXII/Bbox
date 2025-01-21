import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import User from "../models/UserSchema.mjs";

export const register = asyncHandler(async (req, res, next) => {
  const {name, email, password} = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.create({name, email: normalizedEmail, password});

  createAndSendToken(user, 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return next(new ErrorResponse("Please enter email and password", 400));
  }

  const user = await User.findOne({email: normalizedEmail}).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email/password", 401));
  }

  const correctPassword = await user.validatePassword(password);

  if (!correctPassword) {
    return next(new ErrorResponse("Invalid email/password", 401));
  }
  
  createAndSendToken(user, 200, res);
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({success: true, statusCode: 200, data: user})
});

const createAndSendToken = (user, statusCode, res) => {
  const token = user.generateToken();

  res.status(statusCode).json({success: true, statusCode, token});
};
