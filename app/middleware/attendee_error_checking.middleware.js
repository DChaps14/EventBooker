const db = require('../../config/db');


exports.record_is_organiser = async function(req, res, next) {
    try {
        const token = req.header('X-Authorization');
        const event_id = req.params.id;

        if (token) {

            const conn = await db.getPool().getConnection();
            const query = "select * from user where auth_token = ?";
            const [result] = await conn.query(query, token);

            if (result.length === 0) {
                req.is_organiser = false;
                req.user_id = -1;
            } else {
                const user_id = result[0].id.toString();
                req.user_id = user_id;
                const query = 'select organizer_id from event where id = ?';
                const [id_result] = conn.query(query, event_id);
                const organiser_id = id_result[0].organizer_id;

                if (user_id == organiser_id) {
                    req.is_organiser = true;
                } else {
                    req.is_organiser = false;
                }
            }
            conn.release();
            next();
        } else {
            req.is_organiser = false;
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while recording the organiser: ${err}`)
    }
};

exports.check_joined_event = async function(req, res, next) {
    const user_id = req.user_id;
    const event_id = req.params.id;
    try {
        const conn = await db.getPool().getConnection();

        const query = 'select * from event_attendees where event_id = ? and user_id = ?';
        const [rows] = await conn.query(query, [event_id, user_id]);
        conn.release();

        if (rows.length != 0) {
            res.status(403).send("Forbidden: You cannot join an event you have already joined");
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while checking join status: ${err}`)
    }
};

exports.check_not_joined_event = async function(req, res, next) {
    const user_id = req.user_id;
    const event_id = req.params.id;

    try {
        const conn = await db.getPool().getConnection();

        const query = 'select * from event_attendees where event_id = ? and user_id = ?';
        const [rows] = await conn.query(query, [event_id, user_id]);
        conn.release();

        if (rows.length == 0) {
            res.status(403).send("Forbidden: You cannot delete yourself from an event you haven't joined");
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while checking event join status: ${err}`)
    }
};

exports.check_status_not_rejected = async function(req, res, next) {
    const user_id = req.user_id;
    const event_id = req.params.id;
    try {
        const conn = await db.getPool().getConnection();

        const query = 'select attendance_status_id from event_attendees where event_id = ? and user_id = ?';
        const [result] = await conn.query(query, [event_id, user_id]);
        const status_id = result[0].attendance_status_id;

        const find_status_query = 'select name from attendance_status where id = ?';
        const [status_name] = await conn.query(find_status_query, status_id);
        conn.release();
        if (status_name[0].name === 'rejected') {
            res.status(403).send("Forbidden: You cannot delete yourself from this event");
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while checking event attendance status: ${err}`)
    }
};


exports.check_status_appropriate = async function(req, res, next) {
    const status = req.body.status;
    try {
        const conn = await db.getPool().getConnection();
        const query = 'select id from attendance_status where name = ?';
        const [result] = await conn.query(query, status);
        conn.release();

        if (status.length == 0) {
            res.status(400).send("Bad Request: Please provide an appropriate 'status' value");
        } else {
            req.status_id = result[0].id;
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while checking attendance status: ${err}`)
    }

};

exports.check_ids_exist = async function(req, res, next) {
    const user_id = req.params.user_id;
    const event_id = req.params.event_id;

    try {
        const conn = await db.getPool().getConnection();
        const event_query = 'select * from event where id = ?';
        const user_query = 'select * from user where id = ?';
        const [user_results] = await conn.query(user_query, user_id);
        const [event_results] = await conn.query(event_query, event_id);
        conn.release();

        if (user_results.legnth == 0) {
            res.status(404).send(`User with id ${user_id} not found`);
        } else if (event_results.length == 0) {
            res.status(404).send(`Event with id ${event_id} not found`);
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500)
            .send(`Error while checking user and event ids: ${err}`)
    }
};