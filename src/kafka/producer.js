import kafka from '../config/kafka.js';

const producer = kafka.producer({
  // Prevent accidental topic creation in production
  allowAutoTopicCreation: false,

  // Exactly-once style producer behavior at Kafka producer level
  idempotent: true,

  // Maximum number of unacknowledged requests
  // when idempotence is enabled
  maxInFlightRequests: 5,

  // Transaction timeout
  transactionTimeout: 60000,

  // Producer retry configuration
  retry: {
    retries: 8,
    initialRetryTime: 300,
    maxRetryTime: 30000,
    factor: 0.2,
  },
});

let isConnected = false;

/**
 * Connect Kafka producer
 */
export const connectProducer = async () => {
  if (isConnected) {
    return;
  }

  try {
    await producer.connect();

    isConnected = true;

    console.log('[Kafka] Producer connected');
  } catch (error) {
    isConnected = false;

    console.error('[Kafka] Producer connection failed:', error);

    throw error;
  }
};

/**
 * Disconnect Kafka producer
 */
export const disconnectProducer = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await producer.disconnect();

    isConnected = false;

    console.log('[Kafka] Producer disconnected');
  } catch (error) {
    console.error('[Kafka] Producer disconnect failed:', error);

    throw error;
  }
};

/**
 * Publish event to Kafka
 */
export const publishEvent = async ({
  topic,
  key,
  value,
  headers = {},
}) => {
  if (!topic) {
    throw new Error('Kafka topic is required');
  }

  if (value === undefined || value === null) {
    throw new Error('Kafka message value is required');
  }

  if (!isConnected) {
    await connectProducer();
  }

  const message = {
    key: key !== undefined && key !== null
      ? String(key)
      : undefined,

    value:
      typeof value === 'string'
        ? value
        : JSON.stringify(value),

    headers,
  };

  try {
    const result = await producer.send({
      topic,

      messages: [message],
    });

    return result;
  } catch (error) {
    console.error(
      `[Kafka] Failed to publish event to topic "${topic}":`,
      error
    );

    throw error;
  }
};

export default producer;