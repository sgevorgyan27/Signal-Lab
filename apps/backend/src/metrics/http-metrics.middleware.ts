import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const path = this.resolvePath(req);
      this.metrics.httpRequestsTotal.inc({
        method: req.method,
        path,
        status_code: String(res.statusCode),
      });
    });
    next();
  }

  private resolvePath(req: Request): string {
    const route = (req as Request & { route?: { path?: string } }).route;
    if (route?.path) {
      const base = req.baseUrl ?? '';
      return `${base}${route.path}`.replace(/\/+/g, '/') || route.path;
    }
    const raw = req.originalUrl?.split('?')[0] ?? req.url?.split('?')[0] ?? '/';
    return raw || '/unknown';
  }
}
