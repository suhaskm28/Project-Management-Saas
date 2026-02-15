require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function test(name, fn) {
    try {
        console.log(`Testing: ${name}`);
        const p = fn();
        console.log(`  Success`);
        await p.$disconnect();
    } catch (e) {
        console.log(`  Failed: ${e.message.split('\n')[0]}`);
    }
}

async function run() {
    await test('No Args', () => new PrismaClient());
    await test('Empty Object', () => new PrismaClient({}));
    await test('Log Option', () => new PrismaClient({ log: ['info'] }));
    await test('Datasources', () => new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } }
    }));
}

run();
