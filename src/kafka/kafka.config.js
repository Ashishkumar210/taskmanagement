import { Env } from '../config/env.js';

export const KafkaConfig = Object.freeze({
  clientId:
    Env.KAFKA_CLIENT_ID,

  brokers:
    Env.KAFKA_BROKERS,

  connectionTimeout: 10000,

  authenticationTimeout: 10000,

  requestTimeout: 30000,

  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});