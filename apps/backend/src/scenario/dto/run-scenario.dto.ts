import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { SCENARIO_TYPES } from '../scenario.constants';
import type { ScenarioType } from '../scenario.constants';

export class RunScenarioDto {
  @ApiProperty({
    enum: SCENARIO_TYPES,
    example: 'success',
  })
  @IsString()
  @IsIn(SCENARIO_TYPES as unknown as string[])
  type!: ScenarioType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
