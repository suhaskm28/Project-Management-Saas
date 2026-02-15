import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class ProjectMembersService {
    constructor(private prisma: PrismaService) { }

    async addMember(
        projectId: string,
        requesterId: string,
        userId: string,
        role: MemberRole,
    ) {
        const requester = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: requesterId } },
        });

        if (!requester || requester.role === 'member') {
            throw new ForbiddenException();
        }

        return this.prisma.projectMember.create({
            data: { projectId, userId, role },
        });
    }

    async updateRole(
        projectId: string,
        requesterId: string,
        userId: string,
        role: MemberRole,
    ) {
        const requester = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: requesterId } },
        });

        if (requester?.role !== 'owner') {
            throw new ForbiddenException('Only owner can change roles');
        }

        return this.prisma.projectMember.update({
            where: { projectId_userId: { projectId, userId } },
            data: { role },
        });
    }

    async removeMember(
        projectId: string,
        requesterId: string,
        userId: string,
    ) {
        const requester = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: requesterId } },
        });

        if (requester?.role !== 'owner') {
            throw new ForbiddenException();
        }

        return this.prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId } },
        });
    }
}
