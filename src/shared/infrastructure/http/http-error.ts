/**
 * Error dari komunikasi ke backend API.
 * `status = 0` berarti request tidak sampai ke server (timeout / network error).
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string = "HTTP_ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }

  get isNetworkError() {
    return this.status === 0;
  }
}
