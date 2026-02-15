import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(userId: string) {
        const userProjects = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });

        const projectIds = userProjects.map((p) => p.projectId);

        const [
            totalProjects,
            activeTasks,
            completedTasks,
            uniqueMembers,
            upcomingTasks,
            projectsData,
        ] = await Promise.all([
            this.prisma.project.count({
                where: { id: { in: projectIds }, status: { not: 'archived' } },
            }),
            this.prisma.task.count({
                where: { projectId: { in: projectIds }, status: { not: 'completed' } },
            }),
            this.prisma.task.count({
                where: { projectId: { in: projectIds }, status: 'completed' },
            }),
            this.prisma.projectMember.groupBy({
                by: ['userId'],
                where: { projectId: { in: projectIds } },
            }),
            this.prisma.task.findMany({
                where: {
                    projectId: { in: projectIds },
                    status: { not: 'completed' },
                    dueDate: { gte: new Date() },
                },
                include: { project: { select: { name: true } } },
                orderBy: { dueDate: 'asc' },
                take: 5,
            }),
            this.prisma.project.findMany({
                where: { id: { in: projectIds }, status: { not: 'archived' } },
                include: {
                    _count: {
                        select: {
                            tasks: true,
                        },
                    },
                    tasks: {
                        where: { status: 'completed' },
                        select: { id: true },
                    },
                },
            }),
        ]);

        const teamMembersCount = uniqueMembers.length;
        const totalTasks = activeTasks + completedTasks;
        const velocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const projectProgress = projectsData.map((project) => {
            const totalProjectTasks = project._count.tasks;
            const completedProjectTasks = project.tasks.length;
            const progress = totalProjectTasks > 0 ? Math.round((completedProjectTasks / totalProjectTasks) * 100) : 0;
            return {
                id: project.id,
                name: project.name,
                progress,
            };
        });

        return {
            totalProjects,
            activeTasks,
            completedTasks,
            teamMembers: teamMembersCount,
            velocity: `${velocity}%`,
            upcomingTasks,
            projectProgress,
        };
    }
}
