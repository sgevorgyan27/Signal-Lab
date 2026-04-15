import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
        return response.status(status).json({
          ...body,
          timestamp,
        });
      }
      const message = typeof body === 'string' ? body : 'Error';
      return response.status(status).json({
        statusCode: status,
        message,
        timestamp,
      });
    }

    this.logger.error(exception);
    response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      timestamp,
    });
  }
}
