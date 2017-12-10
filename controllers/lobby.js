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
        sendGameDetails(req,res);
    }
    else{
        res.redirect('/login');
    }
        
});

router.post('/', function(req, res, next) {

    database.insert_new_game(req,res)
    .then((result) => sendGameDetails(req,res));
    //console.log(req.session.user);
});

function sendGameDetails(req, res)
{
    console.log( 'send game details');
    database.get_games(req,res)
    .then((data) => {
    
    res.render('lobby',{title:'Lobby Page',games: data});
 });
}
    
return router;

}
module.exports = lobby;