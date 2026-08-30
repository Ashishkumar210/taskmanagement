// import { Kafka, logLevel } from 'kafkajs';

// const kafka = new Kafka({
//   clientId: process.env.KAFKA_CLIENT_ID || 'irctc-backend',

//   brokers: (
//     process.env.KAFKA_BROKERS || 'localhost:9092'
//   ).split(','),

//   connectionTimeout: 10000,
//   authenticationTimeout: 10000,
//   requestTimeout: 30000,

//   retry: {
//     initialRetryTime: 300,
//     retries: 8,
//     maxRetryTime: 30000,
//     factor: 0.2,
//   },

//   logLevel: logLevel.ERROR,
// });

// export default kafka;





import { Kafka, logLevel } from 'kafkajs';

const brokers = (
  process.env.KAFKA_BROKERS || 'localhost:9092'
)
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'user-service',

  brokers,

  connectionTimeout: 10000,
  authenticationTimeout: 10000,
  requestTimeout: 30000,

  retry: {
    initialRetryTime: 300,
    retries: 8,
    maxRetryTime: 30000,
    factor: 0.2,
  },

  logLevel: logLevel.ERROR,
});

export default kafka;