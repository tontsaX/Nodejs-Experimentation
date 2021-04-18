require('dotenv').config()

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
  },
  test: {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
  },
  production: {
    "username": "desdoka",
    "password": "tuoliLJEuo#ks872",
    "database": "RoyalGameOfUr",
    "host": process.env.DB_HOST,
    "url": process.env.DATABASE_URL,
    "dialect": "postgres",
  },
}
