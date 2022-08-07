const env = require('./.env.json')
const TuyaWebsocket = require('./src/websocket/index')

console.log(TuyaWebsocket.URL.EU)

const client = new TuyaWebsocket({
    accessId: env.TUYA_CLIENT_ID,
    accessKey: env.TUYA_SECRET_KEY,
    url: TuyaWebsocket.URL.EU,
    env: TuyaWebsocket.env.PROD, // Test channel
    maxRetryTimes: 50,
})

client.open(() => {
  console.log('open');
});

client.message((ws, message) => {
  client.ackMessage(message.messageId);
  console.log('message', message);
});

client.reconnect(() => {
  console.log('reconnect');
});

client.ping(() => {
  console.log('ping');
});

client.pong(() => {
  console.log('pong');
});

client.close((ws, ...args) => {
  console.log('close', ...args);
});

client.error((ws, error) => {
  console.log('error', error);
});

client.start()
