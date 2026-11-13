import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';

@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('chart-of-accounts')
  @Roles(Role.ADMIN, Role.CONTADOR)
  getChartOfAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Get('journal-entries')
  @Roles(Role.ADMIN, Role.CONTADOR)
  getJournalEntries(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sourceModule') sourceModule?: string,
  ) {
    return this.accountingService.getJournalEntries(startDate, endDate, sourceModule);
  }

  @Post('journal-entries')
  @Roles(Role.ADMIN, Role.CONTADOR)
  createManualEntry(
    @Body() dto: CreateJournalEntryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.accountingService.createManualEntry(dto, userId);
  }

  @Get('reports/financial-summary')
  @Roles(Role.ADMIN, Role.CONTADOR)
  getFinancialSummary() {
    return this.accountingService.getFinancialSummary();
  }
}

