const db = require('../../config/db');

exports.retrieve = async function(event_id) {
    const conn = await db.getPool().getConnection();
    const query = 'select image_filename from event where id = ?';
    const [rows] = await conn.query(query, event_id);
    conn.release();
    return rows;
};

exports.insert = async function(event_id, filename) {
    console.log(filename);
    const conn = await db.getPool().getConnection();
    const query = 'update event set image_filename = ? where id = ?';
    await conn.query(query, [filename, event_id]);
    conn.release();
};