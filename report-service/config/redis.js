//imports
const redis = require("redis");
require("dotenv").config();


// Configura Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

// Conectar a Redis
redisClient
  .connect()
  .then(() => {
    console.log("Conectado a Redis");
    isRedisConnected = true;
  })
  .catch((err) => {
    // console.error("Error conectando a Redis");
    isRedisConnected = false;
  });
