import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry: Registry;
  private readonly scenarioRunsTotal: Counter<'type' | 'status'>;
  private readonly scenarioRunDurationSeconds: Histogram<'type'>;
  readonly httpRequestsTotal: Counter<'method' | 'path' | 'status_code'>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.scenarioRunsTotal = new Counter({
      name: 'scenario_runs_total',
      help: 'Total scenario runs by type and outcome status',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.scenarioRunDurationSeconds = new Histogram({
      name: 'scenario_run_duration_seconds',
      help: 'Scenario handler duration in seconds',
      labelNames: ['type'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status_code'],
      registers: [this.registry],
    });
  }

  recordScenarioRun(type: string, status: string, durationMs: number) {
    this.scenarioRunsTotal.inc({ type, status });
    this.scenarioRunDurationSeconds.observe({ type }, durationMs / 1000);
  }

  async metricsOutput(): Promise<string> {
    return this.registry.metrics();
  }
}
