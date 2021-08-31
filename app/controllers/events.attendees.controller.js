const attendee = require('../models/events.attendees.model');

exports.getAttendees = async function(req, res) {
    const is_organiser = req.is_organiser;
    const event_id = req.params.id

    if (is_organiser) {
        try {
            const attendees = await attendee.retrieveAsOrganiser(event_id);
            const results = []
            for (let i = 0; i < attendees.length; i++) {
                const att = attendees[i];
                results.push({attendeeId: att.user_id, status: att.status, firstName: att.first_name, lastName: att.last_name, dateOfInterest: att.date_of_interest});
            }
            console.log(results);
            res.status(200).send(results);
        } catch (err) {
            res.status(500).send(`Error getting attendees: ${err}`)
        }
    } else {
        let user_id = req.user_id;
        if (!user_id) {
            user_id = -1;
        }
        try {
            const attendees = await attendee.retrieve(event_id, user_id);
            const results = []
            for (let i = 0; i < attendees.length; i++) {
                const att = attendees[i];
                results.push({attendeeId: att.user_id, status: att.status, firstName: att.first_name, lastName: att.last_name, dateOfInterest: att.date_of_interest});
            }
            console.log(results);
            res.status(200).send(results);
        } catch (err) {
            console.error(err);
            res.status(500).send(`Error getting attendees: ${err}`)
        }
    }
};

exports.requestAttendance = async function(req, res) {
    const user_id = req.user_id;
    const event_id = req.params.id;

    try {
        await attendee.attend(event_id, user_id);
        res.status(201).send("Attendance requested successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error requesting attendance: ${err}`);
    }
};

exports.remove = async function(req, res) {
    const user_id = req.user_id;
    const event_id = req.params.id;

    try {
        await attendee.remove(event_id, user_id);
        res.status(200).send("Attendee removed successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error deleting attendee: ${err}`);
    }
};

exports.changeStatus = async function(req, res) {
    const user_id = req.params.user_id;
    const event_id = req.params.event_id;
    const status_id = req.status_id;

    try {
        await attendee.modify(event_id, user_id, status_id);
        res.status(200).send("Attendance status changed successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error changing attendance status: ${err}`);
    }
};