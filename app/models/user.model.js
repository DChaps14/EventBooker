const db = require('../../config/db');
const pass_check = require('../middleware/password.middleware');
const auth = require('../middleware/authentication.middleware');

exports.register = async function(firstName, lastName, email, password){

    const conn = await db.getPool().getConnection();
    const hashed_password = await pass_check.encrypt(password);
    const query = 'insert into user (first_name, last_name, email, password) values (?,?,?,?)';
    const [result] = await conn.query(query, [firstName, lastName, email, hashed_password]);
    conn.release();
    return result;
};

exports.login = async function(email, password){

    const conn = await db.getPool().getConnection();
    const query = 'select id from user where email = ?';
    const [rows] = await conn.query(query, [email]);
    const user_id = rows[0].id;

    const match = await pass_check.compare_passwords(password, user_id);

    if (match) {
        const set_auth_query = 'update user set auth_token = ? where id = ?'
        const auth_token = await auth.generate_token();
        await conn.query(set_auth_query, [auth_token, user_id]);
        conn.release();
        return [user_id, auth_token];
    } else {
        conn.release();
        return [];
    }
};

exports.logout = async function(token){

    const conn = await db.getPool().getConnection();
    const query = 'update user set auth_token = ? where auth_token = ?';
    await conn.query(query, [null, token]);
    conn.release();
};

exports.change = async function(id, first, last, email, password){

    const conn = await db.getPool().getConnection();

    console.log(password);
    console.log(email);


    if (first) {
        const first_query = 'update user set first_name = ? where id = ?';
        await conn.query(first_query, [first, id]);
    }
    if (last) {
        const lastname_query = 'update user set last_name = ? where id = ?';
        await conn.query(lastname_query, [last, id]);
    }
    if (email) {
        const email_query = 'update user set email = ? where id = ?';
        await conn.query(email_query, [email, id]);
    }
    if (password) {
        const password_query = 'update user set password = ? where id = ?';
        const hash = await pass_check.encrypt(password);
        await conn.query(password_query, [hash, id]);
    }
    conn.release();
};

exports.retrieve = async function(id){

    const conn = await db.getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [result] = await conn.query(query, id);
    console.log(result);
    conn.release();
    return result;
};
