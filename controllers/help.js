const express = require('express');
const router = express.Router();

const help = app => {

    router.get('/', function(req, res, next) {
        res.render('help', { title: 'Help Page' }); 
    });

    return router;
}

module.exports = help;