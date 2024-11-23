const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL, // URL de ElastiCache Redis
});

redisClient
  .connect()
  .then(() => console.log("Conectado a Redis"))
  .catch((err) => console.error("Error de conexión a Redis:", err));

module.exports = redisClient;
