import crypto from 'crypto';

import {
  kafkaProducer,
} from './kafka.client.js';

let connected = false;

/**
 * Connect Kafka producer.
 */
export async function connectKafkaProducer() {
  if (connected) {
    return;
  }

  await kafkaProducer.connect();

  connected = true;

  console.log(
    'Kafka producer connected'
  );
}

/**
 * Publish user event.
 */
export async function publishUserEvent({
  event,
  organization_id,
  user_id,
  data,
  event_id,
}) {
  if (!connected) {
    await connectKafkaProducer();
  }

  const payload = {
    event_id:
      event_id ||
      crypto.randomUUID(),

    event,

    version: 1,

    organization_id,

    user_id:
      user_id ?? null,

    timestamp:
      new Date().toISOString(),

    data,
  };

  await kafkaProducer.send({
    topic: 'user.events',

    messages: [
      {
        key:
          organization_id != null
            ? String(organization_id)
            : undefined,

        value:
          JSON.stringify(payload),

        headers: {
          event: Buffer.from(event),

          version:
            Buffer.from('1'),
        },
      },
    ],
  });

  return payload;
}

/**
 * Disconnect Kafka producer.
 */
export async function disconnectKafkaProducer() {
  if (!connected) {
    return;
  }

  await kafkaProducer.disconnect();

  connected = false;

  console.log(
    'Kafka producer disconnected'
  );
}