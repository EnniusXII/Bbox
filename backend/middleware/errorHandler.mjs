import ErrorResponse from "../models/ErrorResponseModel.mjs";

export const errorHandler = (err, req, res, next) => {
  let error = {...err};

  error.message = err.message;

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(`Missing information: ${message}`, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    error: error.message || "Server Error",
  });
};