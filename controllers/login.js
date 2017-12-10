const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
session = require('express-session');


const login = app => {

    app.use(session({
        secret: 'secret-key-test-667',
        resave: true,
        saveUninitialized: true
    }));

    router.get('/', function(req, res, next) {
        res.render('login', { title: 'Login Page' });    
    });

    router.post('/', function(req,res,next){
        
        if(req.body.loginType=='signup'){
            database.insert_new_user(req,res)
            .then((result) => {
                res.redirect('/lobby')
            })
            .catch((err) => {
                res.render('/login',{ errormsg: true});
            })
        }
        else if(req.body.loginType=='login'){
            validateUser(req,res);
            //console.log(req.session.player_id);
            //console.log(req.session.user);
        }
        console.log(req.body.loginType);
        
    });

    function validateUser(req, res)
    {
        database.validateUser(req,res)
        .then((data) => {

        username  = req.body.username;
        req.session.user = req.body.username;
        req.session.admin = true;
        //console.log(data.id);
        req.session.player_id = data.id;
        req.session.save();

        res.redirect('/lobby');
    });
    }

    return router;

}

module.exports = login;