const AWS = require('aws-sdk');
require('dotenv').config();


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const eventBridge = new AWS.EventBridge();


async function publishTransactionEvent(transaction) {
  const params = {
    Entries: [
      {
        Source: 'accountService',
        DetailType: 'trasactionCreated',
        Detail: JSON.stringify(transaction),
        EventBusName: 'default',
      },
    ],
  };

  try {
    const result = await eventBridge.putEvents(params).promise().catch(err => console.log(err));
    console.log('Event published:', result);
  } catch (error) {
    console.error('Error publishing event:', error);
  }
}

module.exports = {
  publishTransactionEvent
}