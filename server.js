const env = require('./.env.json')
const TuyaWebsocket = require('./src/websocket/index')

const client = new TuyaWebsocket({
  accessId: env.TUYA_CLIENT_ID,
  accessKey: env.TUYA_SECRET_KEY,
  url: TuyaWebsocket.URL.EU,
  env: TuyaWebsocket.env.PROD, // Test channel
  maxRetryTimes: 50,
})

client.open(() => {
  console.log('Websocket server started');
});

client.message((ws, message) => {
  client.ackMessage(message.messageId);
  process.send(message.payload.data)
});

client.start()
