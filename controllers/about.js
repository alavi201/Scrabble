const express = require('express');
const router = express.Router();

const about = app => {

    router.get('/', function(req, res, next) {
        res.render('about', { title: 'About Page' }); 
    });

    return router;
}

module.exports = about;