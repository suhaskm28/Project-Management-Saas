import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from '../activity/activity.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private usersService: UsersService,
        private activityService: ActivityService,
    ) { }

    @Get('me')
    async getMe(@Req() req: any) {
        const user = await this.usersService.findOne(req.user.userId);
        const { passwordHash, ...result } = user;
        return result;
    }

    @Patch('me')
    async updateMe(
        @Req() req: any,
        @Body() body: { fullName?: string; email?: string; bio?: string; phone?: string }
    ) {
        const user = await this.usersService.update(req.user.userId, body);
        const { passwordHash, ...result } = user;
        return result;
    }

    @Patch('me/password')
    async changePassword(
        @Req() req: any,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        return this.usersService.updatePassword(
            req.user.userId,
            body.currentPassword,
            body.newPassword
        );
    }

    @Get('me/activity')
    async getMyActivity(@Req() req: any) {
        return this.activityService.getRecentLogs(req.user.userId);
    }
}
