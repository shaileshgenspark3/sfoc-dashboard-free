import { MongoMemoryServer } from 'mongodb-memory-server';
console.log('Test starting');
try {
    const mongod = await MongoMemoryServer.create();
    console.log('URI:', mongod.getUri());
    await mongod.stop();
} catch (err) {
    console.error('Error:', err);
}
