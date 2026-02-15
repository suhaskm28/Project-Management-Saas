import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

describe('UsersController (e2e)', () => {
    let app: INestApplication<App>;
    let prisma: PrismaService;
    let userId: string;
    let cookie: string;
    const email = `test-${Date.now()}@example.com`;
    const password = 'Password123!';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());
        await app.init();

        prisma = app.get<PrismaService>(PrismaService);

        // Setup a test user
        const hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                fullName: 'Test User',
                passwordHash: hash,
            },
        });
        userId = user.id;

        // Login to get cookie
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });

        cookie = (loginRes.get('Set-Cookie') as any)[0];
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { id: userId } });
        await app.close();
    });

    it('/users/me (GET)', async () => {
        const res = await request(app.getHttpServer())
            .get('/users/me')
            .set('Cookie', cookie)
            .expect(200);

        expect(res.body.email).toBe(email);
        expect(res.body.fullName).toBe('Test User');
        expect(res.body.passwordHash).toBeUndefined();
    });

    it('/users/me (PATCH) - update profile', async () => {
        const res = await request(app.getHttpServer())
            .patch('/users/me')
            .set('Cookie', cookie)
            .send({
                fullName: 'Updated Name',
                bio: 'New bio',
                phone: '1234567890'
            })
            .expect(200);

        expect(res.body.fullName).toBe('Updated Name');
        expect(res.body.profile.bio).toBe('New bio');
        expect(res.body.profile.phone).toBe('1234567890');
    });

    it('/users/me/password (PATCH) - change password', async () => {
        const res = await request(app.getHttpServer())
            .patch('/users/me/password')
            .set('Cookie', cookie)
            .send({
                currentPassword: password,
                newPassword: 'NewPassword123!'
            })
            .expect(200);

        expect(res.body.message).toBe('Password updated successfully');

        // Verify login works with new password
        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password: 'NewPassword123!' })
            .expect(201);

        expect(loginRes.body.email).toBe(email);
    });

    it('/users/me/password (PATCH) - fail with wrong password', async () => {
        await request(app.getHttpServer())
            .patch('/users/me/password')
            .set('Cookie', cookie)
            .send({
                currentPassword: 'WrongPassword',
                newPassword: 'SomeOtherPassword'
            })
            .expect(401);
    });
});
