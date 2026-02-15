import {
    Controller,
    Get,
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
import { TasksService } from './tasks.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
    constructor(private tasks: TasksService) { }

    @Post('projects/:projectId/tasks')
    create(
        @Req() req: Request,
        @Param('projectId') projectId: string,
        @Body() body: any,
    ) {
        return this.tasks.createTask(
            projectId,
            req.user!['userId'],
            body,
        );
    }

    @Put('tasks/:id')
    update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: any,
    ) {
        return this.tasks.updateTask(id, req.user!['userId'], body);
    }

    @Delete('tasks/:id')
    remove(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.tasks.deleteTask(id, req.user!['userId']);
    }

    @Get('tasks')
    findAll(@Req() req: Request) {
        return this.tasks.getUserTasks(req.user!['userId']);
    }
}
