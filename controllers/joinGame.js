const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
const controller = require('./game/controller')();
session = require('express-session');
let username

const joinGame = app => {

    //console.log('in joinGame');
    router.get('/:gameId',function(request, response, next) { 
        const game_id = request.params.gameId;
        const user_id = request.session.player_id;

        controller.validate_user_with_game( user_id, game_id )
        .then( (validated) => {
          if( validated ){
            response.redirect('/game/'+game_id); 
          }
          else{
            controller.get_game(game_id)
            .then( (game) => {
              controller.get_game_users(game_id)
              .then( (game_users) => {
                if(game_users.length < parseInt(game.num_players)){
                  database.insert_game_user(game_id, request, response)
                  .then( response.redirect('/game/'+game_id)  );
                }
                else{
                  response.redirect('/lobby'); 
                }
              })
            })           
          }
        });

        //console.log('in get join game');
        
          
    });
    
    router.post('/',function(req, res, next) { 
        res.redirect('/game');   
    });
    return router;
}
module.exports = joinGame;