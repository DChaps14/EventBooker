const user = require('../models/users.images.model');
const fs = require('mz/fs');

exports.getPicture = async function(req, res) {
    const user_id = req.params.id;
    let header = '';
    try {
        const rows = await user.retrieve(user_id);
        let filename = rows[0].image_filename;

        if (filename == null) {
            res.status(404).send("No image exists for that user");
        } else {
            console.log(filename);
            if (/.*\.jpg/.test(filename) || /.*\.jpeg/.test(filename)) {
                header = 'image/jpeg';
            } else if (/.*\.png/.test(filename)) {
                header = 'image/png';
            } else if (/.*\.gif/.test(filename)) {
                header = 'image/gif';
            }
            console.log(header);

            const image_buffer = await fs.readFile('./storage/images/' + filename);
            res.set('content-type', header);
            res.status(200).send(image_buffer);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error reading image: ${err}`);
    }

};

exports.setPicture = async function(req, res) {

    const user_id = req.params.id;
    const binary_image_data = req.body;
    const type = req.filetype;

    try {
        const rows = await user.retrieve(user_id);
        const previous_result = rows[0].image_filename;
        const filename = 'user_' + user_id + type;
        await user.insert(user_id, filename);
        await fs.writeFile('./storage/images/' + filename, binary_image_data, 'binary');

        if (previous_result != null) {
            res.status(200).send('OK: Profile photo successfully updated');
        } else {
            res.status(201).send("Success: Profile photo created successfully")
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error setting the user's photo: ${err}`);
    }
};

exports.removePicture = async function(req, res) {
    const user_id = req.params.id;

    try {

        const rows = await user.retrieve(user_id);
        const filename = rows[0].image_filename;

        if (filename == null) {
            res.status(404).send("No image exists for the specified user");
        } else {
            await user.delete(user_id);
            await fs.unlink('./storage/images/' + filename);
            res.status(200).send('OK: User image deleted successfully');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(`Error deleting user ${user_id} picture: ${err}`);
    }
};
