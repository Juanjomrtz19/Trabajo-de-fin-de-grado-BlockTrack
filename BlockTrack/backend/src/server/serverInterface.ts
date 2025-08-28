class GeneralError extends Error {
  type: string;
  code: number;
  constructor(code: number, message: string, type: string) {
    super(message);
    this.type = type;
    this.code = code;
  }
}

export { GeneralError };
