const bcrypt = require('bcrypt');
const db = require('../../config/db');

exports.encrypt = async function(password) {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
};

exports.compare_passwords = async function(password, user_id) {

    const conn = await db.getPool().getConnection();
    const query = "select password from user where id = ?";
    const [hash] = await conn.query(query, user_id);

    conn.release();

    return await bcrypt.compare(password, hash[0].password);
};