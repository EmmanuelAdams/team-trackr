class ErrorResponse extends Error {
    statusCode: number;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
  
      // This line generates the stack trace similar to Error.captureStackTrace
      // Note: TypeScript doesn't support this.constructor for class constructors directly.
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
  
  export default ErrorResponse;
  