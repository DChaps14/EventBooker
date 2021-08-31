const db = require('../../config/db');

exports.retrieve = async function(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'select image_filename from user where id = ?';
    const [rows] = await conn.query(query, user_id);
    conn.release();
    return rows;
};

exports.insert = async function(user_id, filename) {
    const conn = await db.getPool().getConnection();
    const query = 'update user set image_filename = ? where id = ?';
    await conn.query(query, [filename, user_id]);
    conn.release();
};

exports.delete = async function(user_id) {
    const conn = await db.getPool().getConnection();
    const remove_query = 'update user set image_filename = null where id = ?';
    await conn.query(remove_query, user_id);
    conn.release();
};