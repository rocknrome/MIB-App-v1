const kafka = require('kafka-node');
const { KafkaClient, Producer, Consumer } = kafka;

const client = new KafkaClient({ kafkaHost: 'localhost:9092' });

const producer = new Producer(client);
producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Kafka Producer connection error:', err);
});

const consumer = new Consumer(
  client,
  [{ topic: 'job_events', partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', (message) => {
  console.log('Kafka Consumer received message:', message);
});

consumer.on('error', (err) => {
  console.error('Kafka Consumer error:', err);
});

module.exports = { producer, consumer };
