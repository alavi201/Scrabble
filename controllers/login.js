const express = require('express');
const router = express.Router();

const login = app => {
  
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Login Page' });

        
});

return router;

}

module.exports = login;