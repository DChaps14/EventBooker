const users = require( '../controllers/user.controller' );
const auth = require('../middleware/authentication.middleware');
const check = require('../middleware/user_error_checking.middleware');

module.exports = function( app ) {

    app.route(app.rootUrl + '/users/register')
        .post(check.check_email_format, check.check_email_in_use, check.check_password_present, check.check_names_are_present, users.register);

    app.route(app.rootUrl + '/users/login')
        .post(check.check_email_format, check.check_email_not_in_use, check.check_password_present, users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(auth.check_authorised, users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(check.check_id_exists, check.get_user_id, users.retrieve)
        .patch(check.check_id_exists, auth.check_authorised, check.check_email_in_use,
            check.check_correct_user_authorised, check.check_modify_attributes, users.change);
};