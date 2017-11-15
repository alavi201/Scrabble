const express = require('express');
const router = express.Router();

const game = app => {
  
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('game', { title: 'Game Page' });

    io = app.get('io');
    io.on( 'connection', socket => {
      socket.on('chat message', data => {
        io.emit( 'chat message', data );
        console.log('chat message');
      });
      
      socket.on( 'disconnect', () =>
        console.log( 'disconnected' ));
     })    
});

return router;

}

module.exports = game;