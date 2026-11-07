import { beforeAll, afterAll, expect, test } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
// @ts-ignore supertest types are unnecessary for these integration assertions
import request from 'supertest';

let mongo: MongoMemoryServer;
let app: any;
let admin: string;
let member: string;
let memberId: string;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'integration-test-secret-only-123456789';
  process.env.ADMIN_SETUP_KEY = 'integration-setup';
  app = (await import('../src/app.js')).default;
}, 120000);
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); });

test('administrator email requires private setup key', async () => {
  const response = await request(app).post('/api/auth/register').send({firstName:'Admin',lastName:'Test',email:'drojannp@gmail.com',password:'testPassword123'});
  expect(response.status).toBe(403);
});
test('registration, auth and admin permissions', async () => {
  const a = await request(app).post('/api/auth/register').send({firstName:'Admin',lastName:'Test',email:'drojannp@gmail.com',password:'testPassword123',adminSetupKey:'integration-setup'});
  expect(a.status).toBe(201); admin = a.body.token;
  const u = await request(app).post('/api/auth/register').send({firstName:'Persona',lastName:'Test',email:'member@example.com',password:'testPassword123',secretSanta:true});
  expect(u.status).toBe(201); member = u.body.token; memberId = u.body.user.id;
  expect(u.body.user.passwordHash).toBeUndefined();
  expect((await request(app).get('/api/admin/users').auth(member,{type:'bearer'})).status).toBe(403);
  expect((await request(app).get('/api/results').auth(member,{type:'bearer'})).status).toBe(403);
  expect((await request(app).get('/api/admin/users').auth(admin,{type:'bearer'})).body.users).toHaveLength(2);
});
test('votes are one per member, both counts once per meal, closing is enforced', async () => {
  const config=(await request(app).get('/api/config')).body;
  const availability=config.enabledDates.map((date:string)=>({date,choice:'both'}));
  expect((await request(app).put('/api/votes/mine').auth(member,{type:'bearer'}).send({availability})).status).toBe(200);
  await request(app).put('/api/votes/mine').auth(member,{type:'bearer'}).send({availability});
  expect((await request(app).get('/api/config')).body.voterCount).toBe(1);
  const result=await request(app).get('/api/results').auth(admin,{type:'bearer'});
  expect(result.body.results[0].lunch).toBe(1); expect(result.body.results[0].dinner).toBe(1);
  const changed=await request(app).put('/api/admin/config').auth(admin,{type:'bearer'}).send({deadline:'2020-01-01T00:00:00Z',enabledDates:config.enabledDates});
  expect(changed.status).toBe(200);
  expect((await request(app).put('/api/votes/mine').auth(member,{type:'bearer'}).send({availability})).status).toBe(403);
  expect((await request(app).get('/api/results').auth(member,{type:'bearer'})).status).toBe(200);
});
test('deletion removes vote and revokes existing access tokens', async () => {
  expect((await request(app).delete(`/api/admin/users/${memberId}`).auth(admin,{type:'bearer'})).status).toBe(200);
  expect((await request(app).get('/api/auth/me').auth(member,{type:'bearer'})).status).toBe(401);
  expect((await request(app).get('/api/config')).body.voterCount).toBe(0);
});
