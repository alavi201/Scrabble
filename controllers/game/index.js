const express = require('express');
const router = express.Router();
const controller = require('./controller')();
const { CHAT_MESSAGE, TILE, CONNECTION, DISCONNECT, INVALID_MOVE, NO_DATA, SWAP, CHAT_RECEIVED, CREATE_RACK, DISPLAY_PLAYERS, PASS, GAME_STARTED, JOINED, REMAINING_TILES, CHANGE_TURN, CANCEL } = require('../../constants/events');


const game = app => {
  
  let user_id;
  let game_id;
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
          //console.log("Before add_sockets, User ID: "+user_id + " and game Id: "+ game_id);
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
          response.render('game', { title: 'Game', user_id: user_id, user_name: request.session.user, game_id: game_id, game_board: result[2]});
        }
        else{
          response.render('game', { title: 'Game', user_id: user_id, user_name: request.session.user,game_id: game_id });
        }
      });
    }
  }
  
  const validate_play = (client_data, socket) => {
    data = client_data.play;
    user_id = client_data.user_id;
    game_id = client_data.game_id;
    if( data.length > 0 ){
      return controller.validate_game_play( user_id, game_id, data )
      .then( is_validated => {
        if( is_validated ){
          //console.log("inside if validated-------------------");
          //turn function call
          change_turn(user_id, game_id);
          controller.get_game_board( [0, 0], game_id)
          .then(board => io.in(game_id).emit( 'display board', board ));
          display_player_score(game_id);
          emit_rack( socket, game_id, user_id );
          controller.get_remaining_tiles( game_id )
          .then( remaining_tiles_count => io.in(game_id).emit( REMAINING_TILES,remaining_tiles_count[0].count ));
        }
        else{
          socket.emit( 'invalid move', 'Your move is invalid. Please try again');
          controller.get_game_board( [0, 0], game_id)
          .then(board => io.in(game_id).emit( 'display board', board ));
          emit_rack( socket, game_id, user_id );
        }
      })
    }
    else{
      socket.in( game_id ).emit( NO_DATA, data );
    }

  };

  const swap = (data, game_id, user_id, socket) => {
    if( data.length !== 0 ){
      return controller.swap_user_tiles( user_id, game_id, data )
      .then (swapped_tiles => {
          if(swapped_tiles) {
            emit_rack( socket, game_id, user_id );
            change_turn(user_id, game_id);
            
          }
          else {
            socket.emit( INVALID_MOVE, "Swap Could Not be Completed" );
          }
      })
    }
    else{
      socket.in( socket.room ).emit( NO_DATA, data );
    }

  }; 

  const process_chat_message = (data, io) => {
    return controller.process_message( data.message, data.user)
    .then( data => {
      io.in( game_id ).emit(CHAT_RECEIVED, data);
    })
    //console.log('chat message: ' + data );
  }

  const check_game_full = ( game, app ) => {
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

  const change_turn = (user_id, game_id) => {
    controller.get_current_turn (user_id, game_id)
    .then( current_user_row =>{
      if( current_user_row ){
        controller.get_user_id( current_user_row )
        .then( user_row => {
          io.in(game_id).emit(CHANGE_TURN, user_row[0].username);
          return true;
        }) 
      }
    });
  }

  const emit_start_game = ( ready_to_start, game_id ) => {
    if( ready_to_start ){
      controller.get_game( game_id )
      .then( game => controller.get_user_id(game.creator_id))
      .then( user => io.in( game_id ).emit(CHANGE_TURN, user[0].username))
    }
    return true;
  }

  const display_player_score = (game_id) => {
    controller.get_game_scores(game_id)
    .then( users => io.in(game_id).emit( DISPLAY_PLAYERS, users));
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
        return controller.create_rack_required( game_id, user_id ) 
      }
      else{
        return controller.creator_created_game( game_id, user_id )
      }
    })
    .then( _ => emit_rack(socket, game_id, user_id))
    .then( _ => check_game_full( current_game, app ))
    .then( ready_to_start => emit_start_game( ready_to_start, game_id) )
    .then( _ => display_player_score(game_id))
    .then( _ => {
      controller.get_remaining_tiles( game_id )
      .then( remaining_tiles_count => io.in(game_id).emit( REMAINING_TILES,remaining_tiles_count[0].count ));
    })
  }

  const pass = (client_data, socket) => {
    user_id = client_data.user_id;
    game_id = client_data.game_id;
    change_turn(user_id, game_id);
    //socket.broadcast.in( socket.room ).emit( PASS);
    //console.log('In pass event for user: '+ socket.user_id);
  }

  const cancel = ( game_id, user_id, socket) => {

    controller.get_game_board( [0, 0], game_id)
    .then(board => io.in(game_id).emit( 'display board', board ));
    
    emit_rack( socket, game_id, user_id );
  }

  io.on( CONNECTION, socket => {
    
    const on_socket_connection = (data) => {
      let game_id = data.game_id;
      let user_id = data.user_id;
      socket.join( game_id );  
      return run_socket_connected( game_id, socket, user_id);
    } 

    const socket_process_chat_message = (data) => {
      return process_chat_message(data, io);
    }

    const socket_validate_play = ( data ) => {
      return validate_play(data, socket)
    }

    const socket_swap = (client_data) => {
      let game_id = client_data.game_id;
      let user_id = client_data.user_id;
      let data = client_data.play; 
      return swap(data, game_id, user_id, socket);
    }

    const socket_pass = (data) => {
      return pass(data, socket);
    }

    const socket_cancel = ( data ) => {
      let game_id = data.game_id;
      let user_id = data.user_id;

      return cancel(game_id, user_id, socket);
    }
    
    socket.on( JOINED, on_socket_connection );
    socket.on( CHAT_MESSAGE, socket_process_chat_message);
    socket.on( TILE, socket_validate_play);
    socket.on( SWAP, socket_swap);        
    socket.on( PASS, socket_pass);
    socket.on( CANCEL, socket_cancel);

    socket.on( DISCONNECT, () => {
    }); 

  });

  return router;
}

module.exports = game;