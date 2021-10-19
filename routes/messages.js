/** Routes for messages */

const Router = require("express").Router;
const User = require("../models/user");
const Message = require("../models/message")
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const ExpressError = require("../expressError")

const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const {id} = req.params
        const {username} = req.body;
        
        const result = await Message.get(id);
        
        if(username === result.from_user.username || 
            username === result.to_user.username) return res.send({messsage: result})
        else throw new ExpressError('Unauthorized to see this msg', 401)
    } catch (error) {
        return next(error)
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 * e.g.; {"to_username":"Madyis", "body":"You eat fire"}
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        
        const {username: from_username} = req.user;
        const {to_username, body} = req.body;
        const result = await Message.create({from_username, to_username, body});
        
        if(result.length !== 0) return res.send({messsage: result})
        else throw new ExpressError(`Couldn't send the msg`, 401)
    } catch (error) {
        console.log(error)
        if(error.code === '23503') return next(new ExpressError('Username not present', 404))
        return next(error)
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    try {
        
        const {username} = req.user;
        const {id} = req.params;

        const messageInfo = await Message.get(id);
        

        if (messageInfo.to_user.username === username){
            const readResult = await Message.markRead(id);
            return res.send({readResult})
        }

        throw new ExpressError(`Couldn't mark as read the msg`, 401)
    } catch (error) {
        console.log(error)
        if(error.code === '23503') return next(new ExpressError('Username not present', 404))
        return next(error)
    }
});

module.exports = router;