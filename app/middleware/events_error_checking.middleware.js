const db = require('../../config/db');

exports.check_query_categories = async function(req, res, next) {
    let categories = req.query.categoryIds;
    //Check if there is only one value present for the array
    if (typeof categories == "string") {
        categories = [categories];
    }

    try {
        if (categories) {
            const conn = await db.getPool().getConnection();
            const query = "select name from category where id = ?";
            let badIds = false;
            for (let i = 0; i < categories.length; i++) {
                const [result] = await conn.query(query, categories[i]);
                console.log(result);
                if (result.length === 0) {
                    badIds = true;
                }
            }
            conn.release();
            if (badIds) {
                res.status(400).send("Please provide valid category IDs");
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error checking category IDs");
    }
}


exports.check_event_exists = async function(req, res, next) {
    const id = req.params.id;

    try {
        const conn = await db.getPool().getConnection();
        const query = "select * from event where id = ?";
        const [result] = await conn.query(query, id);
        conn.release();

        if (result.length === 0) {
            res.status(404)
                .send(`Event with id ${id} not found`);
        } else {
            next();
        }
    } catch (err) {
        if (!err.hasBeenLogged) console.error(err);
        res.status(500)
            .send(`Error with server: ${err}`)
    }
};

exports.check_required_attributes = async function(req, res, next) {
    const title = req.body.title;
    const description = req.body.description;
    const categoryIds = req.body.categoryIds;
    const date = req.body.date;

    if (!title || /^\s*$/.test(title)) {
        res.status(400).send("Please provide an event title");
    } else if (!description || /^\s*$/.test(description)) {
        res.status(400).send("Please provide an event description");
    } else if (categoryIds === undefined) {
        res.status(400).send("Please provide what categories your event belongs to");
    } else if (!(date == null)) {
        const dateObj = new Date(date);
        const now = new Date();
        if (dateObj < now) {
            res.status(400).send("Please provide a date in the future");
        } else {
            next();
        }
    } else {
        next();
    }
};

exports.check_each_category = async function(req, res, next) {
    const categoryIds = req.body.categoryIds;

    try {
        if (categoryIds.length == 0) {
            res.status(400).send("Please provide at least 1 valid category ID");
        } else {
            const conn = await db.getPool().getConnection();
            const query = "select name from category where id = ?";
            let badIds = false;
            for (let i = 0; i < categoryIds.length; i++) {
                const [result] = await conn.query(query, categoryIds[i]);
                if (result.length === 0) {
                    badIds = true;
                }
            }
            conn.release();
            if (badIds) {
                res.status(400).send("Please provide valid category IDs");
            } else {
                next();
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send(`Error while checking categories: ${err}`)
    }
};

exports.check_event_in_future = async function(req, res, next) {
    const event_id = req.params.id;
    try {
        const conn = await db.getPool().getConnection();
        const query = "select date from event where id = ?";
        const [date] = await conn.query(query, event_id);
        conn.release();

        const date_obj = new Date(date[0].date);
        const now = new Date();
        if (now > date_obj) {
            res.status(403).send("Cannot access this method with this event, as the event has already happened");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking event date: ${err}`)
    }
};

exports.check_event_organiser = async function(req, res, next) {
    let event_id = req.params.id;

    //Allows the function to be reused for the attendee error checking
    if (!event_id) {
        event_id = req.params.event_id;
    }

    try {

        const conn = await db.getPool().getConnection();
        const query = "select organizer_id from event where id = ?";
        const [id] = await conn.query(query, event_id);
        conn.release();

        const organiser_id = id[0].organizer_id;
        if (organiser_id != req.user_id) {
            res.status(403).send('You are not the organiser of this event');
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking event organiser: ${err}`)
    }
};