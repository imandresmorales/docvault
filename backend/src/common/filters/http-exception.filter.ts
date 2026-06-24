import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = 'Error del servidor';
    let error = 'Internal Server Error';

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      error   = (exceptionResponse as any).error   || error;
    } else {
      message = exceptionResponse as string;
    }

    const body = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log 5xx (server) errors with full stack for debugging.
    // 4xx (client) errors are intentionally kept quiet to reduce noise.
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception.stack,
      );
    } else if (status === 401 || status === 403) {
      // Security-relevant auth failures — log without request body
      this.logger.warn(
        `[AUTH] ${request.method} ${request.url} → ${status} | IP: ${request.ip}`,
      );
    }

    response.status(status).json(body);
  }
}
