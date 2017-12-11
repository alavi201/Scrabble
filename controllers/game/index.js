const express = require('express');
const router = express.Router();
const controller = require('./controller')();
const { CHAT_MESSAGE, TILE, CONNECTION, DISCONNECT, INVALID_MOVE, NO_DATA, SWAP, CHAT_RECEIVED, CREATE_RACK, DISPLAY_PLAYERS, PASS } = require('../../constants/events');


const game = app => {
  
  router.get('/:gameId', function(request, response, next) {
    try{
      if( typeof request.session.user === 'undefined'  ){
        response.redirect('/login');
        return;
      }

      const game_id = request.params.gameId;
      const user_id = request.session.player_id;

      controller.validate_user_with_game( user_id, game_id )
      .then( (validated) => {
        if( validated ){
          add_socket_events( game_id, user_id, request );
          show_page( validated, response, next, game_id, user_id, request );
        }
      });
    }
    catch( error ){
      response.json( error );
      console.log( error );
    }
    
  });

  const show_page = ( validated, response, next, game_id, user_id, request ) => {
    if ( validated ){
      return controller.get_game_board([0, 0], game_id)
      .then( result => {
        if( result[2] ){
          response.render('game', { title: 'Game', game_board: result[2]});
        }
        else{
          response.render('game', { title: 'Game' });
        }
      });
    }
  }
  
  const add_socket_events = ( game_id, user_id, request ) => {
    root_io = app.get('io');
    io = root_io.of('/game');
    io.on( CONNECTION, socket => {
      if( socket.room ){
        console.log('game socket emits already added for:' + user_id)
        return;
      } else {
        socket.room = game_id;
        socket.join( socket.room );
        request.session.game_socket = socket;
        
        socket.on( CHAT_MESSAGE, data => process_chat_message(data, user_id, socket, io) );
        socket.on( TILE, data => validate_play(data, game_id, user_id, socket));
        socket.on( SWAP, data => swap(data, game_id, user_id, socket));
        socket.on( PASS, data => pass(data, socket));

        controller.get_player_rack([user_id, game_id])
        .then( rack => socket.emit( CREATE_RACK, rack));

        controller.get_game_users(game_id)
        .then( users => socket.emit( DISPLAY_PLAYERS, users));
        
        socket.on( DISCONNECT, () => {
          console.log( 'socket disconnected' );
        }); 
      }
    });
  };

  const validate_play = (data, game_id, user_id, socket) => {
    if( data.length > 0 ){
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

  const swap = (data, game_id, user_id, socket) => {
    if( data.length !== 0 ){
      return controller.swap_user_tiles( user_id, game_id, data )
      .then (swapped_tiles => {
          if(swapped_tiles) {
            socket.emit( SWAP, swapped_tiles );
          }
          else {
            socket.in( socket.room ).emit( INVALID_MOVE, data );
          }
      })
    }
    else{
      socket.in( socket.room ).emit( NO_DATA, data );
    }

  }; 

  const process_chat_message = (data, user_id, socket, io) => {
    return controller.process_message( data, user_id)
    .then( data => {
      io.in( socket.room ).emit(CHAT_RECEIVED, data);
    })
    // socket.broadcast.in( socket.room ).emit(CHAT_MESSAGE, data);
    console.log('chat message: ' + data );
  }

  const pass = (socket, data) => {
    socket.broadcast.in( socket.room ).emit( PASS);
    console.log('pass');
  }

  return router;
}

module.exports = game;