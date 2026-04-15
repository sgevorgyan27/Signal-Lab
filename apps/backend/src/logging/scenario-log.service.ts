import { Injectable } from '@nestjs/common';
import pino from 'pino';

type LogLevel = 'info' | 'warn' | 'error';

export type ScenarioLogFields = {
  scenarioType: string;
  scenarioId?: string;
  duration?: number;
  error?: string;
  delayMs?: number;
};

@Injectable()
export class ScenarioLogService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { app: 'signal-lab' },
  });

  scenario(level: LogLevel, fields: ScenarioLogFields, message: string) {
    this.logger[level]({ ...fields, context: 'scenario' }, message);
  }
}
