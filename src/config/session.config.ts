import session, { SessionOptions } from 'express-session';
import { RequestHandler } from 'express';
import { RedisStore } from 'connect-redis';
import { createClient, RedisClientType } from 'redis';

export const getSessionConfig = async (): Promise<RequestHandler> => {
  const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL,
  });

  await redisClient.connect();

  const store = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
  });

  const sessionConfig: SessionOptions = {
    store,
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    },
  };

  // ✅ FIX: cast to RequestHandler
  return session(sessionConfig);
};
