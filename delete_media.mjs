import fs from 'fs';
import { Redis } from '@upstash/redis';

const env = fs.readFileSync('.env.local', 'utf-8');
let url = '';
let token = '';

env.split('\n').forEach(line => {
  if (line.startsWith('UPSTASH_REDIS_REST_URL=')) {
      url = line.substring(line.indexOf('=') + 1).replace(/["']/g, '').trim();
  }
  if (line.startsWith('UPSTASH_REDIS_REST_TOKEN=')) {
      token = line.substring(line.indexOf('=') + 1).replace(/["']/g, '').trim();
  }
});

const redis = new Redis({ url, token });

async function deleteImg() {
  const id = 'xmux3hw7';
  console.log(`Deleting ${id}...`);
  const pipeline = redis.pipeline();
  pipeline.del(`snap:${id}`);
  pipeline.lrem('stats:recent_uploads', 0, id);
  const res = await pipeline.exec();
  console.log('Result:', res);
}

deleteImg().catch(console.error);
