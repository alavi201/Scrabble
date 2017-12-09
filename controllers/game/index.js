const express = require('express');
const router = express.Router();
const controller = require('./controller')();
const { CHAT_MESSAGE, TILE, CONNECTION, DISCONNECT, INVALID_MOVE, NO_DATA } = require('../../constants/events');

const game = app => {
  
  router.get('/:gameId/:userId', function(request, response, next) {
    try{
      const game_id = request.params.gameId;
      const user_id = request.params.userId;


      controller.validate_user_with_game( user_id, game_id )
      .then( (validated) => {
        show_page( validated, response, next, game_id );
      }).catch( error => {
        console.log(error);
      });
      
      //Add the socket events only once
      controller.is_new_player( user_id, game_id )
      .then( new_user => {
        if( new_user ){
          add_socket_events( game_id, user_id );
        }
      }).catch( error => {
        console.log(error);
      });;
      
    }
    catch( error ){
      response.json( error );
      console.log( error );
    }
    
  });

  const show_page = ( boolean_value, response, next, game_id ) => {
    if( boolean_value ){
      controller.get_game_board([0, 0], game_id)
      .then( result => response.render('game', { title: 'Game', game_board: result[2] }));
    }
    else{
      var err = new Error('Forbidden');
      err.status = 403;
      next( err );
    }
  }
  
  //Add socket events
  const add_socket_events = ( game_id, user_id ) => {
    
    io = app.get('io');
    io.on( CONNECTION, socket => 
    {

      controller.mark_as_old_player( user_id, game_id ).then( () => {
        socket.room = game_id;
        socket.join( socket.room );
      }).catch( error => {
        console.log(error);
      });;
      
      socket.on( CHAT_MESSAGE, data => process_chat_message(data, user_id, socket) );
  
      socket.on( TILE, data => validate_play(data, game_id, user_id, socket));
      
      socket.on( DISCONNECT, () => {
        console.log( 'socket disconnected' );
      }); 
    });
  };

  const validate_play = (data, game_id, user_id, socket) => {
    if( data.lenght !== 0 ){
      return controller.validate_game_play( user_id, game_id, data )
      .then( is_validated => {
        if( is_validated ){
          socket.broadcast.in( socket.room ).emit( TILE, data );
        }
        else{
          socket.in( socket.room ).emit( INVALID_MOVE, data );
        }
      })
    }
    else{
      socket.in( socket.room ).emit( NO_DATA, data );
    }

  };

  const process_chat_message = (data, user_id, socket ) => {
    return controller.process_message( data, user_id )
    .then( data => {
      socket.broadcast.in( socket.room ).emit(CHAT_MESSAGE, data);
    })
    // socket.broadcast.in( socket.room ).emit(CHAT_MESSAGE, data);
    console.log('chat message: ' + data );
  }

  return router;
}

module.exports = game;