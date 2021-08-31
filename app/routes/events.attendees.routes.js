const attend = require('../controllers/events.attendees.controller');
const eventCheck = require('../middleware/events_error_checking.middleware');
const attendeeCheck = require('../middleware/attendee_error_checking.middleware');
const auth = require('../middleware/authentication.middleware');

module.exports = function( app ) {

    app.route(app.rootUrl + '/events/:id/attendees')
        .get(eventCheck.check_event_exists, attendeeCheck.record_is_organiser, attend.getAttendees)
        .post(eventCheck.check_event_exists, auth.check_authorised, attendeeCheck.check_joined_event, eventCheck.check_event_in_future, attend.requestAttendance)
        .delete(eventCheck.check_event_exists, auth.check_authorised, attendeeCheck.check_not_joined_event, eventCheck.check_event_in_future,
            attendeeCheck.check_status_not_rejected, attend.remove);

    app.route(app.rootUrl + '/events/:event_id/attendees/:user_id')
        .patch(attendeeCheck.check_ids_exist, auth.check_authorised, eventCheck.check_event_organiser, attendeeCheck.check_status_appropriate, attend.changeStatus);

};