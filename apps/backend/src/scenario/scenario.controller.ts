import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenarioService } from './scenario.service';

@ApiTags('scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(private readonly scenario: ScenarioService) {}

  @Post('run')
  @ApiOperation({
    summary: 'Run a scenario (generates metrics, logs; errors go to Sentry when configured)',
  })
  run(@Body() dto: RunScenarioDto) {
    return this.scenario.run(dto);
  }

  @Get('runs')
  @ApiOperation({ summary: 'Recent scenario runs' })
  listRuns() {
    return this.scenario.listRecent(20);
  }
}
