class ApiError extends Error {
  constructor(
    statuCode,
    message = "Something is wrong",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statuCode = statuCode;
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
