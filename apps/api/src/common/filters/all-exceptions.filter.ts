import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorBody {
  statusCode: number;
  message: string;
  errors: unknown[];
}

/**
 * Centralized error handling. Never leaks stack traces, SQL, or connection
 * details to the client — those are only written to the server log.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, errors } = this.resolve(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `Unhandled exception: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ErrorBody = { statusCode, message, errors };
    response.status(statusCode).json(body);
  }

  private resolve(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'object' && payload !== null) {
        const p = payload as Record<string, unknown>;
        return {
          statusCode: status,
          message: typeof p.message === 'string' ? p.message : exception.message,
          errors: Array.isArray(p.message) ? p.message : (p.errors as unknown[]) ?? [],
        };
      }

      return { statusCode: status, message: exception.message, errors: [] };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with these unique fields already exists',
          errors: [],
        };
      }
      if (exception.code === 'P2025') {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          errors: [],
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: [],
    };
  }
}
