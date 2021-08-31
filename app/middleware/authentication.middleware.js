const db = require('../../config/db');
const randomstring = require('randomstring');

exports.check_authorised = async function(req, res, next) {
    const token = req.header('X-Authorization');
    if (!token) {
        res.status(401).send("User not logged in; to perform this action, please log in");
    } else {
        try {
            const conn = await db.getPool().getConnection();
            const query = "select * from user where auth_token = ?";
            const [result] = await conn.query(query, token);
            conn.release();

            if (result.length == 0) {
                res.status(401)
                    .send("User not logged in; to perform this action, please log in");
            } else {
                req.user_id = result[0].id.toString();
                next();
            }
        } catch (err) {
            res.status(500)
                .send(`Error with server: ${err}`)
        }
    }
};

exports.generate_token = async function() {
    const token = randomstring.generate({length:30, charset:'alphanumeric'});
    return token;
};