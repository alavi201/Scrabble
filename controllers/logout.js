const express = require('express');
const router = express.Router();
session = require('express-session');


const logout = app => {

    router.get('/', function (req, res) {
       req.session.destroy();
        res.redirect('login');
    });

    return router;
}
module.exports = logout;

