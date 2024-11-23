const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
});

module.exports = dynamoDB;
