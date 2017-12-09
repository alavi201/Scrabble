const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
var session;


const lobby = app => {

router.get('/', function(req, res, next) {
    
    console.log('get----------------');
    session=req.session;

    //if(session.admin){
        //console.log("found user in session");
        //console.log(session.user);
    //}
    //console.log(data.id);
    sendGameDetails(req,res);
    

        
});

router.post('/', function(req, res, next) {

    database.insert_new_game(req,res)
    .then((result) => sendGameDetails(req,res));
    //console.log(req.session.user);
    
   // .then((data) => 
        
    //    res.redirect('/lobby');
   // });

        
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