import { MongoMemoryServer } from 'mongodb-memory-server';
const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();
process.env.JWT_SECRET = 'temporary-local-preview-only-123456789';
process.env.ADMIN_SETUP_KEY = 'temporary-local-preview-only';
const app = (await import('../src/app.js')).default;
app.listen(3000, '127.0.0.1', () => console.log('Temporary preview API http://localhost:3000'));
process.on('SIGINT',async()=>{await mongo.stop();process.exit(0)});
