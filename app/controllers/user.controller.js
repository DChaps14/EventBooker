const user = require('../models/user.model');

exports.register = async function(req, res){

    const email = req.body.email;
    const password = req.body.password;
    const first = req.body.firstName;
    const last = req.body.lastName;

    try {
        const result = await user.register(first, last, email, password);
        res.status(201)
            .send({userId: result.insertId});
    } catch(err) {
        res.status(500)
            .send(`Error registering users ${err}`)
    }
};

exports.login = async function(req, res){

    const email = req.body.email;
    const password = req.body.password;

    try {
        const result = await user.login(email, password);
        if (result.length == 0) {
            res.status(400).send("Password provided is incorrect");
        } else {
            res.status(200).send({userId: result[0], token: result[1]});
        }
    } catch(err) {
        res.status(500).send(`Error logging user in: ${err}`);
    }
};

exports.logout = async function(req, res){
    const token = req.header('X-Authorization');

    try {
        await user.logout(token);
        res.status(200)
            .send("Logout Successful");
    } catch(err) {
        res.status(500)
            .send( `Error logging user out: ${err}`);
    }
};

exports.change = async function(req, res){
    const requested_id = req.params.id; //The id the user has passed in the parameter
    const new_first = req.body.firstName;
    const new_last = req.body.lastName;
    const new_email = req.body.email;
    const new_password = req.body.password;

    try {
        await user.change(requested_id, new_first, new_last, new_email, new_password);
        res.status(200)
            .send("Update successful");
    } catch (err) {
        res.status(500).send(`Error updating user ${req.user_id}: ${err}`)
    }

};

exports.retrieve = async function(req, res){
    const request_id = req.params.id;
    const user_id = req.user_id;

    try {
        const result = await user.retrieve(request_id);
        console.log(result[0]);
        console.log(result[0].first_name);
        if (request_id === user_id) {
            res.status(200).send({
                firstName: result[0].first_name,
                lastName: result[0].last_name,
                email: result[0].email
            });
        } else {
            res.status(200).send({
                firstName: result[0].first_name,
                lastName: result[0].last_name
            });
        }
    } catch (err) {
        res.status(500).send(`Error retrieving user with id ${user_id}`);
    }
};