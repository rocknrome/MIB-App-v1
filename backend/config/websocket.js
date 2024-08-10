let io;

module.exports = {
  init: function (server) {
    io = require('socket.io')(server);
    return io;
  },
  getIo: function () {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
