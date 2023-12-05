const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: '',
  secretAccessKey: '',
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = { dynamoDB };
