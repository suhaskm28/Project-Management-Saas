import {
    Controller,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectMembersService } from './project-members.service';
import { MemberRole } from '@prisma/client';

@Controller('projects/:projectId/members')
@UseGuards(JwtAuthGuard)
export class ProjectMembersController {
    constructor(private members: ProjectMembersService) { }

    @Post()
    add(
        @Req() req: Request,
        @Param('projectId') projectId: string,
        @Body() body: { userId: string; role: MemberRole },
    ) {
        return this.members.addMember(
            projectId,
            req.user!['userId'],
            body.userId,
            body.role,
        );
    }

    @Put(':userId')
    update(
        @Req() req: Request,
        @Param('projectId') projectId: string,
        @Param('userId') userId: string,
        @Body() body: { role: MemberRole },
    ) {
        return this.members.updateRole(
            projectId,
            req.user!['userId'],
            userId,
            body.role,
        );
    }

    @Delete(':userId')
    remove(
        @Req() req: Request,
        @Param('projectId') projectId: string,
        @Param('userId') userId: string,
    ) {
        return this.members.removeMember(
            projectId,
            req.user!['userId'],
            userId,
        );
    }
}
