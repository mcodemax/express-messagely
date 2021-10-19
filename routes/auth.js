/** routes for authentication */

const express = require("express");
const ExpressError = require('../expressError');
const jwt = require('jsonwebtoken');
const router = new express.Router();
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser }
    = require("../middleware/auth")
const User = require('../models/user');
const {SECRET_KEY} = require('../config')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body;

        if(await User.authenticate(username, password)){
            let token = jwt.sign({username}, SECRET_KEY); //{username, type:"admin"} can add extra info to payload with JWT signature
            User.updateLoginTimestamp(username);
            
            return res.send({token});
        }else{
            throw new ExpressError("Invalid User or password", 400)
        }
    } catch (error) {
        return next(error);
    }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 * 
 * e.g. {"username":"Paulie", "password":"passy1", "first_name":"Paulie", "last_name":"Walnuts" , "phone":8672099}
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try {
        const {username, password, first_name, last_name, phone} = req.body;
        
        const response = await User.register({username, password, first_name, last_name, phone});
        User.updateLoginTimestamp(req.body.username);
        
        let token = jwt.sign({username}, SECRET_KEY);
        await User.updateLoginTimestamp(username);
        
        return res.send({token});        
    } catch (error) {
        return next(error);
    }
});

module.exports = router;