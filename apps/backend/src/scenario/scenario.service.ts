import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { ScenarioLogService } from '../logging/scenario-log.service';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { sleep } from './scenario.constants';

@Injectable()
export class ScenarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly logger: ScenarioLogService,
  ) {}

  async run(dto: RunScenarioDto) {
    const started = Date.now();
    const durationMs = () => Date.now() - started;

    const baseMeta =
      dto.name?.trim() != null && dto.name.trim() !== ''
        ? { name: dto.name.trim() }
        : undefined;

    switch (dto.type) {
      case 'teapot': {
        const run = await this.prisma.scenarioRun.create({
          data: {
            type: 'teapot',
            status: 'teapot',
            duration: durationMs(),
            metadata: { easter: true, ...baseMeta },
          },
        });
        this.metrics.recordScenarioRun('teapot', 'teapot', durationMs());
        this.logger.scenario(
          'info',
          {
            scenarioType: 'teapot',
            scenarioId: run.id,
            duration: durationMs(),
          },
          'teapot_easter_egg',
        );
        throw new HttpException(
          { signal: 42, message: "I'm a teapot" },
          HttpStatus.I_AM_A_TEAPOT,
        );
      }
      case 'validation_error': {
        const run = await this.prisma.scenarioRun.create({
          data: {
            type: 'validation_error',
            status: 'validation_error',
            error: 'Validation failed (demo)',
            duration: durationMs(),
            metadata: baseMeta,
          },
        });
        this.metrics.recordScenarioRun(
          'validation_error',
          'validation_error',
          durationMs(),
        );
        this.logger.scenario(
          'warn',
          {
            scenarioType: 'validation_error',
            scenarioId: run.id,
            duration: durationMs(),
            error: 'Validation failed (demo)',
          },
          'validation_error',
        );
        Sentry.addBreadcrumb({
          category: 'scenario',
          message: 'validation_error',
          level: 'warning',
          data: { scenarioId: run.id },
        });
        throw new BadRequestException(
          'Validation failed (demo validation_error)',
        );
      }
      case 'system_error': {
        const run = await this.prisma.scenarioRun.create({
          data: {
            type: 'system_error',
            status: 'error',
            error: 'Demo system_error',
            duration: durationMs(),
            metadata: baseMeta,
          },
        });
        this.metrics.recordScenarioRun('system_error', 'error', durationMs());
        const err = new Error('Demo system_error');
        this.logger.scenario(
          'error',
          {
            scenarioType: 'system_error',
            scenarioId: run.id,
            duration: durationMs(),
            error: err.message,
          },
          'system_error',
        );
        Sentry.captureException(err);
        throw new InternalServerErrorException(
          'Internal server error (demo system_error)',
        );
      }
      case 'slow_request': {
        const delayMs = 2000 + Math.floor(Math.random() * 3000);
        await sleep(delayMs);
        const run = await this.prisma.scenarioRun.create({
          data: {
            type: 'slow_request',
            status: 'completed',
            duration: durationMs(),
            metadata: { ...baseMeta, delayMs },
          },
        });
        this.metrics.recordScenarioRun(
          'slow_request',
          'completed',
          durationMs(),
        );
        this.logger.scenario(
          'warn',
          {
            scenarioType: 'slow_request',
            scenarioId: run.id,
            duration: durationMs(),
            delayMs,
          },
          'slow_request',
        );
        return {
          id: run.id,
          status: run.status,
          duration: run.duration ?? durationMs(),
        };
      }
      case 'success': {
        const run = await this.prisma.scenarioRun.create({
          data: {
            type: 'success',
            status: 'completed',
            duration: durationMs(),
            metadata: baseMeta,
          },
        });
        this.metrics.recordScenarioRun('success', 'completed', durationMs());
        this.logger.scenario(
          'info',
          {
            scenarioType: 'success',
            scenarioId: run.id,
            duration: durationMs(),
          },
          'scenario_completed',
        );
        return {
          id: run.id,
          status: run.status,
          duration: run.duration ?? durationMs(),
        };
      }
    }
  }

  async listRecent(limit = 20) {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
