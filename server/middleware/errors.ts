import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Express 4 does not catch rejected promises from async handlers, which leaves
 * requests hanging. Wrap every async route with this helper.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Final error handler: logs the error and returns JSON without leaking internals.
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = Number(err?.status || err?.statusCode) || 500;
  if (status >= 500 && !(err instanceof HttpError)) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  } else if (status >= 500) {
    console.warn(`[${req.method} ${req.originalUrl}] ${status}: ${err.message}`);
  }
  if (res.headersSent) return;
  const message = status >= 500 && !(err instanceof HttpError) ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}
