import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
    constructor(private activity: ActivityService) { }

    @Get('project/:projectId')
    getProjectLogs(@Param('projectId') projectId: string) {
        return this.activity.getProjectLogs(projectId);
    }

    @Get('recent')
    async getRecentLogs(@Req() req: any) {
        return this.activity.getRecentLogs(req.user.userId);
    }
}
