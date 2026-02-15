import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
    constructor(private comments: CommentsService) { }

    @Post()
    add(
        @Req() req: Request,
        @Param('taskId') taskId: string,
        @Body() body: { content: string },
    ) {
        return this.comments.addComment(
            taskId,
            req.user!['userId'],
            body.content,
        );
    }

    @Get()
    list(@Req() req: Request, @Param('taskId') taskId: string) {
        return this.comments.getComments(taskId, req.user!['userId']);
    }
}
