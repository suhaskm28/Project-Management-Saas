import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { MemberRole, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(
        private prisma: PrismaService,
        private activity: ActivityService
    ) { }

    async createProject(userId: string, data: { name: string; description?: string }) {
        const project = await this.prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: MemberRole.owner,
                    },
                },
            },
        });

        await this.activity.log(project.id, userId, 'PROJECT_CREATED', { name: project.name });

        return project;
    }

    async getProjects(userId: string, filter?: { status?: ProjectStatus; type?: 'all' | 'owned' | 'shared' | 'archived' }) {
        const where: any = {
            members: {
                some: { userId },
            },
        };

        if (filter?.status) {
            where.status = filter.status;
        } else if (filter?.type === 'archived') {
            where.status = ProjectStatus.archived;
        } else {
            // Default: exclude archived unless specifically requested via status or type=archived
            where.status = { not: ProjectStatus.archived };
        }

        if (filter?.type === 'owned') {
            where.ownerId = userId;
        } else if (filter?.type === 'shared') {
            where.ownerId = { not: userId };
        }

        return this.prisma.project.findMany({
            where,
            include: {
                _count: {
                    select: {
                        members: true,
                        tasks: true,
                    },
                },
                members: {
                    take: 3,
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getProjectById(userId: string, projectId: string) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId },
            },
        });

        if (!member) throw new ForbiddenException();

        return this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                },
                tasks: true,
            },
        });
    }

    async addMember(userId: string, projectId: string, targetEmail: string, role: MemberRole = MemberRole.member) {
        const admin = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (admin?.role !== 'owner') throw new ForbiddenException();

        const userToInvite = await (this.prisma as any).user.findUnique({ where: { email: targetEmail } });
        if (!userToInvite) throw new Error('User not found');

        return this.prisma.projectMember.create({
            data: {
                projectId,
                userId: userToInvite.id,
                role,
            },
        });
    }

    async updateProject(
        userId: string,
        projectId: string,
        data: { name?: string; description?: string; status?: ProjectStatus }
    ) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!member) throw new ForbiddenException('Not a project member');
        if (member.role === 'member') throw new ForbiddenException('Only owner or admin can update project');

        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: {
                name: data.name,
                description: data.description,
                status: data.status,
            },
        });

        // Log the update
        const changes: string[] = [];
        if (data.name) changes.push(`name to "${data.name}"`);
        if (data.description !== undefined) changes.push('description');
        if (data.status) changes.push(`status to ${data.status}`);

        if (changes.length > 0) {
            await this.activity.log(projectId, userId, 'PROJECT_UPDATED', {
                changes: changes.join(', '),
            });
        }

        return project;
    }

    async getProjectMembers(userId: string, projectId: string) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!member) throw new ForbiddenException('Not a project member');

        return this.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
    }

    async getProjectActivity(userId: string, projectId: string) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (!member) throw new ForbiddenException('Not a project member');

        return (this.prisma as any).activityLog.findMany({
            where: { projectId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async archiveProject(userId: string, projectId: string) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });

        if (member?.role !== 'owner') {
            throw new ForbiddenException('Only owner can archive project');
        }

        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { status: ProjectStatus.archived },
        });

        await this.activity.log(projectId, userId, 'PROJECT_ARCHIVED', {
            name: project.name,
        });

        return project;
    }

    async deleteProject(userId: string, projectId: string) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId, userId },
            },
        });

        if (member?.role !== 'owner') {
            throw new ForbiddenException('Only owner can delete project');
        }

        return this.prisma.project.delete({
            where: { id: projectId },
        });
    }
}
