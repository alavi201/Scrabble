const express = require('express');
const router = express.Router();
const db = require('../db');
const dbjs = require('../db/tempQueries')
const database = new dbjs(db)
session = require('express-session');
let username

const auth = function(req, res, next) {
    
    if (req.session && (req.session.user === username) && req.session.admin)
    {
        return next();
    }
    else
    {
        return res.render('login',{errormsg: false});
    }
};

const login = app => {

    app.use(session({
        secret: 'secret-key-test-667',
        resave: true,
        saveUninitialized: true
    }));

    router.get('/', auth,function(req, res, next) {
        //res.render('login', { title: 'Login Page' }); 
        response.redirect('/lobby');   
    });

    router.post('/', function(req,res,next){
        
        if(req.body.loginType=='signup'){
            database.insert_new_user(req,res)
            .then((result) => {
                validateUser(req,res);
            })
            .catch((err) => {
                res.render('/login',{ errormsg: true});
            })
            
        }
        else if(req.body.loginType=='login'){
            validateUser(req,res);
        }
        console.log(req.body.loginType);
        
    });

    function validateUser(req, res)
    {
        database.validateUser(req,res)
        .then((data) => {
        
        username  = req.body.username;
        req.session.user = req.body.username;
        req.session.player_id = data.id;
        req.session.save();
        console.log( "User logged in: "+req.session.player_id);
        console.log( "User logged in: "+req.session.user);
        res.redirect('/lobby');
    });
    }

    return router;

}

module.exports = login;