const express = require('express');
const router = express.Router();
const controller = require('./controller')();
const { CHAT_MESSAGE, TILE, CONNECTION, DISCONNECT } = require('../../constants/events');

const game = app => {
  
  router.get('/:gameId', function(request, response, next) {
    try{
      const game_id = request.params.gameId;
      const user_id = 1;
      //Validate the user, URI, etc.
      //If successful validation proceed with showing the page.
      controller.validate_user_with_game( user_id, game_id ).then( (validated) => {
        show_page( validated, response, next );
      });
      
      //Add the socket events only once
      controller.is_new_player( user_id, game_id ).then( new_user => {
        if( new_user ){
          add_socket_events( game_id, user_id );
        }
      });
      
    }
    catch( error ){
      response.json( error );
      console.log( error );
    }
    
  });

  const show_page = ( boolean_value, response, next) => {
    if( boolean_value ){
      response.render('game', { title: 'Game' });
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
      });
      
      socket.on( CHAT_MESSAGE, data => {
        
        controller.process_message( data )
        .then( data => {
          socket.broadcast.in( socket.room ).emit(CHAT_MESSAGE, data);
        });
        // socket.broadcast.in( socket.room ).emit(CHAT_MESSAGE, data);
        console.log('chat message: ' + data );
      });
  
      socket.on( TILE, data => {
        //TODO Implement this function
        controller.validate_game_play( user_id, game_id, data )
        .then( is_validated => {
          if( is_validated ){
            socket.broadcast.in( socket.room ).emit( TILE, data );
          }
          else{
            //Inform user about incorrect data by probably using different event name?
            // socket.in( socket.room ).emit( 'tile', data );
          }
        });
        // socket.broadcast.in( socket.room ).emit( TILE, data );
        console.log( 'tile' );
      });
      
      socket.on( DISCONNECT, () => {
        // Don't use this for game quit logic
        console.log( 'socket disconnected' );
      }); 
    });
  };

  return router;
}

module.exports = game;