const express = require('express');
const router = express.Router();


const lobby = app => {

router.get('/', function(req, res, next) {
    res.render('lobby', { title: 'Lobby Page' });

        
});
    
return router;

}
module.exports = lobby;