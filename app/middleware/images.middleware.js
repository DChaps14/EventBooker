exports.get_file_extension = async function(req, res, next) {
    const type = req.header('Content-Type');
    console.log("Here");
    if (type == 'image/jpeg') {
        req.filetype =  '.jpg';
        next();
    } else if (type == 'image/png') {
        req.filetype = '.png';
        next();
    } else if (type == 'image/gif') {
        req.filetype = '.gif';
        next();
    } else {
        res.status(400).send('Bad Request: \'Content-Type\' Header not one of \'image/png\', \'image/jpeg\', or \'image/gif\'');
    }
};