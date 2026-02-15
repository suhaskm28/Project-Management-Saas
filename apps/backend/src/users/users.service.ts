import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });

        if (!user) throw new NotFoundException('User not found');

        // Sensitive fields should be handled by the controller or a DTO
        return user;
    }

    async update(id: string, data: { fullName?: string; email?: string; bio?: string; phone?: string }) {
        if (data.email) {
            const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
            if (existing && existing.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    fullName: data.fullName,
                    email: data.email,
                },
            });

            await tx.userProfile.upsert({
                where: { userId: id },
                create: {
                    userId: id,
                    bio: data.bio,
                    phone: data.phone,
                },
                update: {
                    bio: data.bio,
                    phone: data.phone,
                },
            });
        });

        return this.findOne(id);
    }

    async updatePassword(id: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Current password incorrect');

        const hash = await bcrypt.hash(newPassword, 10);

        await this.prisma.user.update({
            where: { id },
            data: { passwordHash: hash },
        });

        return { message: 'Password updated successfully' };
    }
}
