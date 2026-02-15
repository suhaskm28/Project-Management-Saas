import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    Query,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectStatus } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
    constructor(private projects: ProjectsService) { }

    @Post()
    create(@Req() req: Request, @Body() body: { name: string; description?: string }) {
        return this.projects.createProject(req.user!['userId'], body);
    }

    @Get()
    findAll(
        @Req() req: Request,
        @Query('type') type?: 'all' | 'owned' | 'shared' | 'archived',
        @Query('status') status?: ProjectStatus
    ) {
        return this.projects.getProjects(req.user!['userId'], { type, status });
    }

    @Get(':id')
    findOne(@Req() req: Request, @Param('id') id: string) {
        return this.projects.getProjectById(req.user!['userId'], id);
    }

    @Patch(':id')
    update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: { name?: string; description?: string; status?: ProjectStatus }
    ) {
        return this.projects.updateProject(req.user!['userId'], id, body);
    }

    @Get(':id/members')
    getMembers(@Req() req: Request, @Param('id') id: string) {
        return this.projects.getProjectMembers(req.user!['userId'], id);
    }

    @Get(':id/activity')
    getActivity(@Req() req: Request, @Param('id') id: string) {
        return this.projects.getProjectActivity(req.user!['userId'], id);
    }

    @Patch(':id/archive')
    archive(@Req() req: Request, @Param('id') id: string) {
        return this.projects.archiveProject(req.user!['userId'], id);
    }

    @Post(':id/members')
    async addMember(
        @Req() req: any,
        @Param('id') projectId: string,
        @Body() body: { email: string; role?: string },
    ) {
        return this.projects.addMember(req.user.userId, projectId, body.email, body.role as any);
    }

    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        return this.projects.deleteProject(req.user!['userId'], id);
    }
}
