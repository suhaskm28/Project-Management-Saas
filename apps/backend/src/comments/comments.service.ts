import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CommentsService {
    constructor(
        private prisma: PrismaService,
        private activity: ActivityService
    ) { }

    async addComment(taskId: string, userId: string, content: string) {
        const task = await (this.prisma.task.findUnique as any)({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) throw new ForbiddenException();

        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: task.projectId,
                    userId,
                },
            },
        });

        const comment = await (this.prisma as any).taskComment.create({
            data: { taskId, userId, content },
        });

        await this.activity.log(task.projectId, userId, 'COMMENT_ADDED', {
            taskTitle: task.title,
            taskId: task.id
        });

        return comment;
    }

    async getComments(taskId: string, userId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) throw new ForbiddenException();

        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId: task.projectId,
                    userId,
                },
            },
        });

        if (!member) throw new ForbiddenException();

        return (this.prisma as any).taskComment.findMany({
            where: { taskId },
            include: { user: true },
            orderBy: { createdAt: 'asc' },
        });
    }
}
