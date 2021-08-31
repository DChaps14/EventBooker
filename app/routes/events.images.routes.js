const event = require('../controllers/events.images.controller');
const auth = require('../middleware/authentication.middleware');
const check = require('../middleware/events_error_checking.middleware');
const middle = require('../middleware/images.middleware');

module.exports = function(app) {

    app.route(app.rootUrl + '/events/:id/image')
        .get(check.check_event_exists, event.getPicture)
        .put(check.check_event_exists, auth.check_authorised, check.check_event_organiser, middle.get_file_extension, event.setPicture);

};