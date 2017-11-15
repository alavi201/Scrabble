const socketIO = require( 'socket.io' )

const initSocket = (server, app) => {
    const io = socketIO( server )
    
    app.set( 'io', io )

    app.use(function(req, res, next) {
        req.io = io;
        next();
      });
}
module.exports = initSocket;