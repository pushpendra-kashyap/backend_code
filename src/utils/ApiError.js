class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something is wrong",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statussCode = statusCode;
    this.data = null;
    this.success = false;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
