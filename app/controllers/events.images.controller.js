const event = require('../models/events.images.model');
const fs = require('mz/fs');

exports.getPicture = async function(req, res) {
    const event_id = req.params.id;
    let header = '';

    try {
        const rows = await event.retrieve(event_id);
        let filename = rows[0].image_filename;
        console.log(filename);

        if (filename == null) {
            res.status(400).send("No picture exists for that event");
        } else {
            if (/.*\.jpg/.test(filename) || /.*\.jpeg/.test(filename)) {
                header = 'image/jpeg';
            } else if (/.*\.png/.test(filename)) {
                header = 'image/png';
            } else if (/.*\.gif/.test(filename)) {
                header = 'image/gif';
            }
            if (!(/event_\d*\.[jpg|png|gif]/.test(filename))) {
                filename = "event_"+event_id;
                if (header == 'image/jpeg') {
                    filename += '.jpg';
                } else if (header == 'image/png') {
                    filename += '.png';
                } else if (header == 'image/gif') {
                    filename += '.gif';
                }
            }

            const image_buffer = await fs.readFile('./storage/images/' + filename);
            res.set('Content-Type', header);
            res.status(200).send(image_buffer);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error reading image to buffer: ${err}`);
    }

};

exports.setPicture = async function(req, res) {
    const event_id = req.params.id;
    const binary_image_data = req.body;
    const type = req.filetype;
    try {

        const rows = await event.retrieve(event_id);
        const previous_result = rows[0].image_filename;
        const filename = 'event_' + event_id + type;
        await event.insert(event_id, filename);
        await fs.writeFile('./storage/images/' + filename, binary_image_data, 'binary');

        console.log(filename);

        if (previous_result != null) {
            res.status(200).send('OK: Hero image successfully updated');
        } else {
            res.status(201).send("Success: Hero image created successfully")
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(`Error setting the event's hero image: ${err}`);
    }
};
