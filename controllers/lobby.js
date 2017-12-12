const express = require('express');
const router = express.Router();
const db = require('../db');
const queries = require('../db/queries')(db);
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
var session;
const { CHAT_MESSAGE, CONNECTION, DISCONNECT, CHAT_RECEIVED, } = require('../constants/events');

const lobby = app => {


    let io = app.io.of('/lobby');

    router.get('/', function(req, res, next) {
        
        session=req.session;

        if(session.user){
            sendGameDetails(req,res);
        }
        else{
            res.redirect('/login');
        }
            
    });

    router.post('/', function(req, res, next) {

        console.log('in post lobby');


        database.insert_new_game(req,res)
        .then((result) => {
            //console.log(result.id);
            database.insert_game_user(result.id,req,res)
            res.redirect( '/game/'+ result.id);
        });
    });

    function sendGameDetails(req, res)
    {
        //console.log( 'send game details');
        database.get_games(req,res)
        .then((data) => {
        
        res.render('lobby',{title:'Lobby Page',games: data, user_id: req.session.player_id, user_name: req.session.user });
    });
    }

    const process_chat_message = (data, io) => {
        let message = data.user + " : " + data.message;
        io.emit(CHAT_RECEIVED, message);
        console.log('chat message: ' + message );
    }

    io.on( CONNECTION, socket => {
        
        const socket_process_chat_message = (data) => {
        return process_chat_message(data, io);
        }
        
        socket.on( CHAT_MESSAGE, socket_process_chat_message);

        socket.on( DISCONNECT, () => {
        }); 

    });
        
    return router;

}
module.exports = lobby;