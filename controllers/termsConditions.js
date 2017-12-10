const express = require('express');
const router = express.Router();

const termsConditions = app => {

    router.get('/', function(req, res, next) {
        res.render('termsConditions', { title: 'Terms and Conditions Page' }); 
    });

    return router;
}

module.exports = termsConditions;