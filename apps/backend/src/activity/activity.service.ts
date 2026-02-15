import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
    constructor(private prisma: PrismaService) { }

    log(
        projectId: string | null,
        userId: string | null,
        action: string,
        metadata?: any,
    ) {
        return (this.prisma as any).activityLog.create({
            data: {
                projectId,
                userId,
                action,
                metadata,
            },
        });
    }

    getProjectLogs(projectId: string) {
        return (this.prisma as any).activityLog.findMany({
            where: { projectId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    getRecentLogs(userId: string) {
        return (this.prisma as any).activityLog.findMany({
            where: {
                project: {
                    members: {
                        some: { userId }
                    }
                }
            },
            include: {
                user: true,
                project: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }
}
