const events = require( '../controllers/events.controller' );
const auth = require('../middleware/authentication.middleware')
const check = require('../middleware/events_error_checking.middleware');

module.exports = function( app ) {

    app.route(app.rootUrl + '/events')
        .get(check.check_query_categories, events.getAll)
        .post(check.check_required_attributes, check.check_each_category, auth.check_authorised, events.add);

    app.route(app.rootUrl + '/events/categories')
        .get(events.getCategory);

    app.route(app.rootUrl + '/events/:id')
        .get(check.check_event_exists, events.getOne)
        .patch(check.check_event_exists, auth.check_authorised, check.check_event_organiser, check.check_each_category,
            check.check_event_in_future, events.modify)
        .delete(check.check_event_exists, auth.check_authorised, check.check_event_organiser, events.remove);

};