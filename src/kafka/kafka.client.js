import { Kafka } from 'kafkajs';

import {
  KafkaConfig,
} from './kafka.config.js';

export const kafka = new Kafka({
  clientId:
    KafkaConfig.clientId,

  brokers:
    KafkaConfig.brokers,

  connectionTimeout:
    KafkaConfig.connectionTimeout,

  authenticationTimeout:
    KafkaConfig.authenticationTimeout,

  requestTimeout:
    KafkaConfig.requestTimeout,

  retry:
    KafkaConfig.retry,
});

export const kafkaProducer =
  kafka.producer({
    allowAutoTopicCreation: false,

    idempotent: true,

    maxInFlightRequests: 5,
  });