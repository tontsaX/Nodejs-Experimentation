const express = require('express');
const app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log("server is running"))

module.exports = {server: server, app: app};