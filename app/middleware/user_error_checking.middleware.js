const db = require('../../config/db');
const pass_check = require('../middleware/password.middleware');

exports.check_id_exists = async function(req, res, next) {

    const id = req.params.id;
    try {
        const conn = await db.getPool().getConnection();
        const query = "select * from user where id = ?";
        const [result] = await conn.query(query, id);
        conn.release();

        if (result.length === 0) {
            res.status(404)
                .send(`User with id ${id} not found`);
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking id: ${err}`)
    }
};

exports.check_email_in_use = async function(req, res, next) {
    const email = req.body.email;
    try {
        if (email) {
            const conn = await db.getPool().getConnection();
            const query = "select * from user where email = ?";
            const [result] = await conn.query(query, email);
            conn.release();

            if (result.length != 0) {
                res.status(400).send("Email is already in use. Please enter another email");
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking email: ${err}`)
    }
};

exports.check_email_not_in_use = async function(req, res, next) {
    const email = req.body.email;
    try {
        const conn = await db.getPool().getConnection();
        const query = "select * from user where email = ?";
        const [result] = await conn.query(query, email);
        conn.release();

        if (result.length == 0) {
            res.status(400).send("Email is not in use. Please enter another email, or register with the provided email");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking email: ${err}`)
    }
};

exports.check_email_format = async function(req, res, next) {
    const email = req.body.email;

    try {
        if (!email.includes("@")) {
            res.status(400)
                .send("Email must contain an '@' symbol");
        } else if (!email) {
            res.status(400).send("Please provide an email");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking email format: ${err}`)
    }
}

exports.check_password_present = async function(req, res, next) {
    const password = req.body.password;
    try {
        if (!password) {
            res.status(400).send("Please provide a password");
        } else if (password && /^\s*$/.test(password)) {
            res.status(400).send("Please provide a password");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking password: ${err}`)
    }
};

exports.check_names_are_present = async function(req, res, next) {
    const first = req.body.firstName;
    const last = req.body.lastName;
    try {
        if (!first) {
            res.status(400).send("Please provide a first name");
        } else if (!last) {
            res.status(400).send("Please provide a last name");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking for names: ${err}`)
    }
};

exports.get_user_id = async function(req, res, next) {
    let token = req.header('X-Authorization');

    try {
        if (!token) {
            req.user_id = (-1).toString();
        } else {
            const conn = await db.getPool().getConnection();
            const query = "select * from user where auth_token = ?";
            const [result] = await conn.query(query, token);
            conn.release();
            if (result.length === 0) {
                req.user_id = (-1).toString();
            } else {
                req.user_id = result[0].id.toString();
            }
        }
        next();
    } catch (err) {
        res.status(500)
            .send(`Error while getting user id: ${err}`)
    }
};

exports.check_correct_user_authorised = async function(req, res, next) {
    const logged_in_id = req.user_id;
    const requested_id = req.params.id;

    if (logged_in_id != requested_id) {
        res.status(403).send(`Forbidden: You must be logged in as user with id ${requested_id}`);
    } else {
        next();
    }
};

exports.check_modify_attributes = async function(req, res, next) {
    const user_id = req.user_id; //The id of the logged in user performing the action
    const email = req.body.email;
    const current_password = req.body.currentPassword;
    const new_password = req.body.password;

    try {
        if (email && !email.includes("@")) {
            res.status(400).send("Please provide an appropriate email");
        } else if (new_password && !current_password) {
            res.status(400).send("Please provide your current password to change your password");
        } else if (new_password && !(await pass_check.compare_passwords(current_password, user_id))) {
            res.status(400).send("Current password is not correct");
        } else if (new_password && /^\s*$/.test(new_password)) {
            res.status(400).send("Password cannot be blank");
        } else {
            next();
        }
    } catch (err) {
        res.status(500)
            .send(`Error while checking the attributes to be modified: ${err}`)
    }
};