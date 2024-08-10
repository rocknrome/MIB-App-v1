const socketIo = require('socket.io');
let io = null;

module.exports = {
  init: function (server) {
    io = socketIo(server);
    return io;
  },
  getIo: function () {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
