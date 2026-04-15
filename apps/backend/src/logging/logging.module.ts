import { Global, Module } from '@nestjs/common';
import { ScenarioLogService } from './scenario-log.service';

@Global()
@Module({
  providers: [ScenarioLogService],
  exports: [ScenarioLogService],
})
export class LoggingModule {}
