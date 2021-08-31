const db = require('../../config/db');

exports.retrieveAsOrganiser = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id, attendance_status.name as status, first_name, last_name, date_of_interest from user, event_attendees, attendance_status" +
        " where user.id = event_attendees.user_id and attendance_status_id = attendance_status.id and event_id = ? order by date_of_interest asc";
    const [rows] = await conn.query(query, id);
    conn.release();
    return rows;
};

exports.retrieve = async function(id, user_id) {
    const conn = await db.getPool().getConnection();
    const query = "select user_id, attendance_status.name as status, first_name, last_name, date_of_interest from user, event_attendees, attendance_status" +
        " where user.id = event_attendees.user_id and attendance_status_id = attendance_status.id and event_id = ? and name = 'accepted' order by date_of_interest asc";
    let [rows] = await conn.query(query, id);
    const check_self = "select user_id, attendance_status.name as status, first_name, last_name, date_of_interest from user, event_attendees, attendance_status" +
        " where user.id = event_attendees.user_id and attendance_status_id = attendance_status.id and event_id = ? and user_id = ? order by date_of_interest asc";
    const [self_row] = await conn.query(check_self, [id, user_id]);
    if (self_row.length != 0 && (self_row[0].status === "pending" || self_row[0].status === "rejected")) {
        rows += self_row;
    }
    conn.release();
    return rows;
};

exports.attend = async function(id, user_id) {
    const conn = await db.getPool().getConnection();
    let query = "select id from attendance_status where name = 'pending'"
    const [result] = await conn.query(query);
    const status_id = result[0].id;
    query = "insert into event_attendees (event_id, user_id, attendance_status_id, date_of_interest) values (?,?,?,?)"
    const date = new Date();
    await conn.query(query, [id, user_id, status_id, date]);
    conn.release();
};

exports.remove = async function(id, user_id) {
    const conn = await db.getPool().getConnection();
    const query = "delete from event_attendees where event_id = ? and user_id = ?"
    await conn.query(query, [id, user_id]);
    conn.release();
};

exports.modify = async function(event_id, user_id, status_id) {
    const conn = await db.getPool().getConnection();
    const query = "update event_attendees set attendance_status_id = ? where event_id = ? and user_id = ?";
    await conn.query(query, [status_id, event_id, user_id]);
    conn.release();
};
