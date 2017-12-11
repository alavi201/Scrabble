const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
var session;


const lobby = app => {

router.get('/', function(req, res, next) {
    
    session=req.session;

    if(session.user){
        //console.log('before sendGame');
        sendGameDetails(req,res);
    }
    else{
        //console.log('before redirect to login');
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
    
    res.render('lobby',{title:'Lobby Page',games: data});
 });
}
    
return router;

}
module.exports = lobby;