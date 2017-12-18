const express = require('express');
const router = express.Router();
const db = require('../db');
const queries = require('../db/queries')(db);
var session;

const account = app => {

    router.get('/', function(req, res, next) {
        session=req.session;
        
        if(session.user){
            Promise.all([
                queries.get_user_id(session.player_id),
                queries.get_game_stats(session.player_id),
                queries.get_avg_score(session.player_id)
            ])
            .then( ([user_details,game_details,avg_score]) => {
                console.log(game_details.length)
                res.render('account',{title:'Account',avgScore:avg_score, user: user_details, game: game_details, user_id: req.session.player_id, user_name: req.session.user });
            });
            
        }
        else{
            res.redirect('/login');
        }
    });

    router.post('/', function(req, res, next) {
        session=req.session;
        Promise.all([
            queries.update_password(req,res)
            
        ])
        .then( ([user_details,game_details,avg_score]) => {
            res.redirect('/account');
        });
    });

   

    return router;
}

module.exports = account;