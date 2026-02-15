import { Controller, Post, Body, Res, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('register')
    async register(
        @Body() body: { email: string; fullName: string; password: string }
    ) {
        return this.auth.register(body.email, body.fullName, body.password);
    }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response
    ) {
        const { accessToken, refreshToken, user } = await this.auth.login(body.email, body.password);

        this.setCookies(res, accessToken, refreshToken);

        return user;
    }

    @Post('refresh')
    async refresh(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const token = req.cookies?.['refresh_token'];
        if (!token) throw new UnauthorizedException('No refresh token provided');

        const { accessToken, refreshToken, user } = await this.auth.refreshTokens(token);
        this.setCookies(res, accessToken, refreshToken);
        return user;
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(
        @Req() req: any,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshToken = req.cookies?.['refresh_token'];
        if (refreshToken) {
            await this.auth.revokeRefreshToken(refreshToken);
        }

        // Also clear all for user
        await this.auth.logout(req.user.userId);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: any) {
        return req.user;
    }

    private setCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
