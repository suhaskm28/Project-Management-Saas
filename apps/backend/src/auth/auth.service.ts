import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService
    ) { }

    async register(email: string, fullName: string, password: string) {
        const hash = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                email,
                fullName,
                passwordHash: hash,
            },
        });
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        return this.generateTokens(user);
    }

    async generateTokens(user: User) {
        const accessToken = jwt.sign(
            { sub: user.id, email: user.email },
            this.config.get<string>('JWT_SECRET')!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { sub: user.id },
            this.config.get<string>('JWT_REFRESH_SECRET')!,
            { expiresIn: '7d' }
        );

        // Store refresh token in DB
        await (this.prisma as any).refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return { accessToken, refreshToken, user };
    }

    async refreshTokens(token: string) {
        try {
            const payload = jwt.verify(token, this.config.get<string>('JWT_REFRESH_SECRET')!) as any;
            const storedToken = await (this.prisma as any).refreshToken.findUnique({
                where: { token },
                include: { user: true }
            });

            if (!storedToken || storedToken.expiresAt < new Date()) {
                if (storedToken) await this.revokeRefreshToken(token);
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            // Revoke old token and generate new pair (rotation)
            await this.revokeRefreshToken(token);
            return this.generateTokens(storedToken.user);
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async revokeRefreshToken(token: string) {
        await (this.prisma as any).refreshToken.delete({ where: { token } }).catch(() => { });
    }

    async logout(userId: string) {
        // Revoke all tokens for this user on logout for absolute security
        await (this.prisma as any).refreshToken.deleteMany({ where: { userId } });
    }
}
