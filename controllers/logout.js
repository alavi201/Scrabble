const express = require('express');
const router = express.Router();
session = require('express-session');
console.log('in logout----------');


const logout = app => {

    router.get('/', function (req, res) {
       // console.log('in logout-------------------');
       req.session.destroy();
        res.render('login',{title:'Login Page'});
    });

    return router;
}
module.exports = logout;

