let history = [];

configureSocketIO = (http) => {
  let io = require('socket.io')(http);

  io.on('connection', (socket) => {

    socket.on('chat:send', (data) => {
      history.push(data);
      if( history.length > 100 ) history.splice(0, history.length - 100);

      socket.broadcast.emit('chat:update', data);
    });

    socket.on('chat:ready', () => {
      socket.emit('chat:update', history);
    });

  });

  return io;
}

module.exports = configureSocketIO;
