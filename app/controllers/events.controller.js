const event = require('../models/events.model');

exports.getAll = async function(req, res) {
    let start = req.query.startIndex;
    const count = req.query.count;
    const searchTerm = req.query.q;
    const categoryIds = req.query.categoryIds;
    const organiserId = req.query.organizerId;
    const sortBy = req.query.sortBy;

    if (start == null) {
        start = 0;
    }

    try {
        const rows = await event.getAll(searchTerm, categoryIds, organiserId, sortBy);

        const results = []
        //If the number of total results is smaller than the starting index, return an empty array
        if (start < rows.length) {

            let smallest = rows.length;
            //This will hold as false if count is undefined
            if (count && rows.length > parseInt(count) + parseInt(start)) {
                smallest = parseInt(count)+parseInt(start);
            }

            for (var i = parseInt(start); i < smallest; i++) {
                const result = rows[i];
                results.push({
                    eventId: result.id,
                    title: result.title,
                    categories: result.categories,
                    organizerFirstName: result.first_name,
                    organizerLastName: result.last_name,
                    numAcceptedAttendees: result.attendees,
                    capacity: result.capacity,
                    date: result.date
                });
            }
        }
        res.status(200).send(results);
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error getting events: ${err}`);
    }
};

exports.getOne = async function(req, res) {
    const event_id = req.params.id;

    try {
        const result = await event.getOne(event_id);
        console.log(result);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(`Error getting event ${event_id}: ${err}`);
    }
};

exports.getCategory = async function(req, res) {

    try {
        const rows = await event.getCategory();
        res.status(200).send(rows);
    } catch (err) {
        res.status(500).send(`Error getting event categories: ${err}`);
    }

};

exports.add = async function(req, res) {
    const title = req.body.title;
    const desc = req.body.description;
    const date = req.body.date;
    const categoryIds = req.body.categoryIds;
    let online = req.body.isOnline;
    if (!online) {
        online = false;
    }
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const control = req.body.requiresAttendanceControl;
    const fee = req.body.fee;
    const id = req.user_id;

    try {
        const eventId = await event.add(title, desc, categoryIds, date, online, url, venue, capacity, control, fee, id);
        res.status(201).send({eventId:eventId});
    } catch (err) {
        res.status(500).send(`Error creating event: ${err}`);
    }
};

exports.modify = async function(req, res) {
    const event_id = req.params.id;
    const title = req.body.title;
    const desc = req.body.description;
    const date = req.body.date;
    const categoryIds = req.body.categoryIds;
    const online = req.body.isOnline;
    const url = req.body.url;
    const venue = req.body.venue;
    const capacity = req.body.capacity;
    const control = req.body.requiresAttendanceControl;
    const fee = req.body.fee;

    try {
        await event.modify(event_id, title, desc, categoryIds, date, online, url, venue, capacity, control, fee);
        res.status(200).send('Event updated successfully');
    } catch (err) {
        res.status(500).send(`Error updating event: ${err}`);
    }
};

exports.remove = async function(req, res) {
    const event_id = req.params.id;

    try {
        await event.delete(event_id);
        res.status(200).send("Event deleted successfully");
    } catch (err) {
        res.status(500).send(`Error deleting event: ${err}`);
    }
};