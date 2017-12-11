const express = require('express');
const router = express.Router();
const controller = require('./controller')();
const { CHAT_MESSAGE, TILE, CONNECTION, DISCONNECT, INVALID_MOVE, NO_DATA, SWAP, CHAT_RECEIVED, CREATE_RACK, DISPLAY_PLAYERS, PASS, GAME_STARTED } = require('../../constants/events');


const game = app => {
  

  let io = app.io.of('/game');

  router.get('/:gameId', function(request, response, next) {
    try{
      if( typeof request.session.user === 'undefined'  ){
        response.redirect('/login');
        return;
      }

      game_id = request.params.gameId;
      user_id = request.session.player_id;

      controller.validate_user_with_game( user_id, game_id )
      .then( (validated) => {
        if( validated ){
          console.log("Before add_sockets, User ID: "+user_id + " and game Id: "+ game_id);
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

  const process_chat_message = (data) => {
    return controller.process_message( data, user_id)
    .then( data => {
      io.in( game_id ).emit(CHAT_RECEIVED, data);
    })
    console.log('chat message: ' + data );
  }

  const check_game_full = ( game, app  ) => {
    let ready_to_start;
    let playerCount = app.io.nsps['/game'].adapter.rooms[game_id].length;
    let max_number_players = parseInt(game.num_players);
    if( playerCount == max_number_players ){
      ready_to_start = true;
    }
    else{
      ready_to_start = false;
    }
    return ready_to_start;
  }

  const get_sockets_room = ( io, room ) => {
    let sock_keys = io.adapter.rooms[room].sockets;
    let keys = Object.keys( sock_keys )
    let client_sockets =[];
    keys.forEach(function(key) {
      client_sockets.push(io.connected[key]);
    }, this);
    return client_sockets;
  }

  const check_game_started = ( game ) => {
    let status = parseInt(game.status);
    if( status == 0 ){
      return false;
    }
    else{
      return true;
    }

  }

  const emit_rack = ( socket, game_id, user_id ) => {
    controller.get_player_rack([ user_id, game_id ])
    .then( rack => {
      socket.emit( CREATE_RACK, rack)
      return true;
    });
  }

  const emit_start_game = ( ready_to_start ) => {
    if( ready_to_start ){
      io.in( game_id ).emit(GAME_STARTED, "game started");
    }
  }

  const run_socket_connected = (game_id, socket, user_id) => {
    let current_game;
    return controller.get_game( game_id )
    .then( game => {
      current_game = game;
      return check_game_started( game );
    })
    .then( result => {
      if( result ){
        return ontroller.create_rack_required( game_id, user_id ) 
      }
      else{
        return controller.creator_created_game( game_id, user_id )
      }
    })
    .then( _ => emit_rack(socket, game_id, user_id))
    .then( _ => check_game_full( current_game ))
    .then( emit_start_game );
  }

  const pass = (socket, data) => {
    socket.broadcast.in( socket.room ).emit( PASS);
    console.log('In pass event for user: '+ socket.user_id);
  }

  io.on( CONNECTION, socket => {
    console.log('In game sockets for user:' + user_id + " game id: "+ game_id);
    if( socket.room ){
      console.log('game socket emits already added for:' + user_id + " game id: "+ game_id);
    } 
    else {
      socket.room = game_id;
      socket.user_id = user_id;
      socket.join( socket.room );

      console.log("-----------------Socket Connected------------------");
      console.log("User ID: "+user_id + " and game ID: " + game_id);
      console.log("Number of players in Room:"+game_id+" are: "+app.io.nsps['/game'].adapter.rooms[game_id].length);

      run_socket_connected( game_id, socket, user_id);

      socket.on( CHAT_MESSAGE, process_chat_message);
      socket.on( TILE, data => validate_play(data, game_id, user_id, socket));
      socket.on( SWAP, data => swap(data, game_id, user_id, socket));        
      socket.on( PASS, data => pass(data, socket));

      //Move this to game start event
      controller.get_game_users(game_id)
      .then( users => socket.emit( DISPLAY_PLAYERS, users));
      
      socket.on( DISCONNECT, () => {
        console.log( 'socket disconnected for user:' + socket.user_id );
      }); 
    }
  });

  return router;
}

module.exports = game;