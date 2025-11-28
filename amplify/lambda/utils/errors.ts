const errorNames = ['INVALID_DATA'] as const;
export type ErrorNames = (typeof errorNames)[number];

export class ApiError extends Error {
  errorName: ErrorNames;
  errorMessage?: string;
  payload?: object;

  constructor(errorName: ErrorNames, errorMessage?: string, payload?: object) {
    super(errorName);
    this.errorName = errorName;
    this.errorMessage = errorMessage;
    this.payload = payload;
  }
}

/**
 * @throws {Error}
 */
export const throwApiError = (
  errorName: ErrorNames,
  errorMessage?: string,
  payload?: object
): never => {
  console.error(`[API ERROR]: ${errorName}: ${errorMessage}`);
  throw new ApiError(errorName, errorMessage, payload);
};
