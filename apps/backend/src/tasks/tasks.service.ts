import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private activity: ActivityService
    ) { }

    async createTask(
        projectId: string,
        userId: string,
        data: {
            title: string;
            description?: string;
            priority?: number;
            dueDate?: Date;
            assignedTo?: string;
        },
    ) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!member) throw new ForbiddenException();

        const task = await this.prisma.task.create({
            data: {
                projectId,
                title: data.title,
                description: data.description,
                priority: data.priority ?? 1,
                dueDate: data.dueDate,
                assignedTo: data.assignedTo,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        await this.activity.log(projectId, userId, 'TASK_CREATED', { title: task.title });

        return task;
    }

    async updateTask(
        taskId: string,
        userId: string,
        data: any,
    ) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true },
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

        if (
            member.role === 'member' &&
            task.assignedTo !== userId
        ) {
            throw new ForbiddenException();
        }

        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data,
            include: {
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
        });

        const action = data.status === 'completed' ? 'TASK_COMPLETED' : 'TASK_UPDATED';
        await this.activity.log(task.projectId, userId, action, { title: task.title });

        return updatedTask;
    }

    async deleteTask(taskId: string, userId: string) {
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

        if (member?.role === 'member') {
            throw new ForbiddenException();
        }

        await this.prisma.task.delete({
            where: { id: taskId },
        });

        await this.activity.log(task.projectId, userId, 'TASK_DELETED', { title: task.title });

        return { success: true };
    }

    async getUserTasks(userId: string) {
        const userProjects = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });

        const projectIds = userProjects.map((p) => p.projectId);

        return this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                assignee: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
}
