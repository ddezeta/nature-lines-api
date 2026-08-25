export interface HttpError extends Error {
  status: number;
}

export function createHttpError(status: number, message: string): HttpError {
  return Object.assign(new Error(message), { status });
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && typeof (error as { status?: unknown }).status === "number";
}
