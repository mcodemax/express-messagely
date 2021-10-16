/** User class for message.ly */
const bcrypt = require("bcrypt");
const db = require("../db");
const ExpressError = require("../expressError")
const {BCRYPT_WORK_FACTOR} = require("../config")
/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   * 
   *    const userobj = {username:'Paulie', password:'passy1', first_name:'Paulie', last_name:'Walnuts', phone:'8673509'}
   *    const userobj2 = {username:'Dolly', password:'passy1', first_name:'Paulie', last_name:'Llama', phone:'867709'}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const joinAt = new Date();
    const encryptPass = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    //authenticate unique username maybe get() Username, if something returned

    const response = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, phone
    `,[username, encryptPass, first_name, last_name, phone, joinAt]);
    
    if(response.rows.length !== 0) return {...response.rows[0]}
    else throw new ExpressError("Can't add user", 404)
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const response = await db.query(`
      SELECT username, password FROM users
        WHERE username=$1
    `,[username]);
    
    if(!response.rows.length) throw new ExpressError("Invalid User", 404)
    
    return await bcrypt.compare(password, response.rows[0].password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const logIn = new Date();
    const response = await db.query(`
        UPDATE users
          SET last_login_at=$1
          WHERE username=$2
          RETURNING last_login_at
      `,[logIn, username]);

    if(response.rows.length === 0) throw new ExpressError('Time Stamp update failed', 404)

    return response.rows[0]['last_login_at']
    //return something if update fails?
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const response = await db.query(`
        SELECT username, first_name, last_name, phone FROM users;
      `);

    if(response.rows.length !== 0){
      return response.rows;
    }else{
      throw new ExpressError('Could not get all users', 404);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const response = await db.query(`
      SELECT username,
      first_name,
      last_name,
      phone,
      join_at,
      last_login_at
        FROM users
        WHERE username=$1
    `,[username])

    if(!response.rows.length) throw new ExpressError("Invalid User", 404)

    return response.rows[0]

  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const response = await db.query(`
      SELECT m.id, m.body, m.sent_at, m.read_at,
      u.username, u.first_name, u.last_name, u.phone
        FROM users AS u JOIN messages AS m
          ON u.username = m.to_username
        WHERE from_username=$1
    `,[username])

    return response.rows.map(msg => ({
      id: msg.id,
      to_user: {
        username: msg.username,
        first_name: msg.first_name, 
        last_name: msg.last_name, 
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const response = await db.query(`
      SELECT m.id, m.body, m.sent_at, m.read_at,
      u.username, u.first_name, u.last_name, u.phone
        FROM users AS u JOIN messages AS m
          ON u.username = m.to_username
        WHERE to_username=$1
    `,[username])

    return response.rows.map(msg => ({
      id: msg.id,
      to_user: {
        username: msg.username,
        first_name: msg.first_name, 
        last_name: msg.last_name, 
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at
    }));
  }
}


module.exports = User;
//node -i -e "$(< models/user.js)"
//node -i -e "$(< user.js)"