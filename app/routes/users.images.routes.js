const user = require('../controllers/users.images.controller');
const check = require('../middleware/user_error_checking.middleware');
const auth = require('../middleware/authentication.middleware');
const middle = require('../middleware/images.middleware');

module.exports = function(app) {

    app.route(app.rootUrl + '/users/:id/image')
        .get(check.check_id_exists, user.getPicture)
        .put(check.check_id_exists, auth.check_authorised, check.check_correct_user_authorised, middle.get_file_extension, user.setPicture)
        .delete(check.check_id_exists, auth.check_authorised, check.check_correct_user_authorised, user.removePicture);

};