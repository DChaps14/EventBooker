const db = require('../../config/db');

exports.getOne = async function(event_id) {
    const conn = await db.getPool().getConnection();
    const query = "select * from event where id = ?";
    const [result] = await conn.query(query, event_id);

    let event = result[0];

    const user_id = event.organizer_id;
    const organiser_query = "select first_name, last_name from user where id = ?";
    const [names] = await conn.query(organiser_query, user_id);
    event.organizerFirstName = names[0].first_name;
    event.organizerLastName = names[0].last_name;

    const category_query = "select category_id from event_category where event_id = ?";
    const [categories] = await conn.query(category_query, event_id);
    const event_categories = [];
    for (var i = 0; i < categories.length; i++) {
        event_categories.push(categories[i].category_id);
    }
    event.categories = event_categories;

    if (event.is_online == 0) {
        event.is_online = false;
    } else if (event.is_online == 1) {
        event.is_online = true;
    }

    if (event.requires_attendance_control == 0) {
        event.requires_attendance_control = false;
    } else if (event.requires_attendance_control == 1) {
        event.requires_attendance_control = true;
    }

    conn.release()
    return event;
};

exports.getAll = async function(searchTerm, categoryIds, organiserId, sortBy) {
    const conn = await db.getPool().getConnection();
    const create_temp_table = "create or replace table temp as select event.id, event.title, event.description, event.capacity, event.organizer_id, user.first_name, " +
        "user.last_name, event.date, (select count(*) from event_attendees join attendance_status on attendance_status_id = " +
        "attendance_status.id where event_id = event.id and attendance_status.name = 'accepted') 'attendees' from event join user on event.organizer_id = user.id";
    await conn.query(create_temp_table);

    if (searchTerm != null) {
        const update_temp = "delete from temp where title not like ? and description not like ?";
        await conn.query(update_temp, ["%"+searchTerm+"%", "%"+searchTerm+"%"]);
    }
    if (organiserId != null) {
        const update_temp = "delete from temp where organizer_id != ?";
        await conn.query(update_temp, organiserId);
    }
    if (categoryIds != null) {
        const create_category_table = "create or replace table temp2 as select event_id from event_category where category_id = ?";
        await conn.query(create_category_table, categoryIds[0]);
        for (let i = 1; i < categoryIds.length; i++) {
            const update_temp = "insert into temp2 select event_id from event_category where category_id = ?";
            await conn.query(update_temp, categoryIds[i]);
        }
        const delete_query = "delete from temp where id not in (select event_id from temp2)";
        await conn.query(delete_query);
        await conn.query("drop table temp2");
    }
    let query = ""
    switch (sortBy) {
        case 'ALPHABETICAL_ASC':
            query = "select * from temp order by title asc";
            break;
        case 'ALPHABETICAL_DESC':
            query = "select * from temp order by title desc";
            break;
        case 'DATE_ASC':
            query = "select * from temp order by date asc";
            break;
        case 'ATTENDEES_ASC':
            query = "select * from temp order by attendees asc";
            break;
        case 'ATTENDEES_DESC':
            query = "select * from temp order by attendees desc";
            break;
        case 'CAPACITY_ASC':
            query = "select * from temp order by capacity asc";
            break;
        case 'CAPACITY_DESC':
            query = "select * from temp order by capacity desc";
            break;
        default:
            query = "select * from temp order by date desc";
            break;
    }
    const [results] = await conn.query(query);
    for (var i = 0; i < results.length; i++) {
        const eventId = results[i].id;
        const category_query = "select category_id from event_category where event_id = ?";
        const [categories] = await conn.query(category_query, eventId);
        const event_categories = [];
        for (var j = 0; j< categories.length; j++) {
            event_categories.push(categories[j].category_id);
        }
        results[i].categories = event_categories;
    }
    await conn.query("drop table temp");
    conn.release()
    return results;
};

exports.modify = async function(event_id, title, description, categoryIds, date, online, url, venue, capacity, control, fee) {
    const conn = await db.getPool().getConnection();

    if (title) {
        const query = 'update event set title = ? where id = ?';
        await conn.query(query, [title, event_id]);
    }
    if (description) {
        const query = 'update event set description = ? where id = ?';
        await conn.query(query, [description, event_id]);
    }
    if (date) {
        const query = 'update event set date = ? where id = ?';
        await conn.query(query, [date, event_id]);
    }
    if (online != null) {
        const query = 'update event set is_online = ? where id = ?';
        await conn.query(query, [online, event_id]);
    }
    if (url) {
        const query = 'update event set url = ? where id = ?';
        await conn.query(query, [url, event_id]);
    }
    if (venue) {
        const query = 'update event set venue = ? where id = ?';
        await conn.query(query, [venue, event_id]);
    }
    if (capacity != null) {
        const query = 'update event set capacity = ? where id = ?';
        await conn.query(query, [capacity, event_id]);
    }
    if (control != null) {
        const query = 'update event set requires_attendance_control = ? where id = ?';
        await conn.query(query, [control, event_id]);
    }
    if (fee != null) {
        const query = 'update event set fee = ? where id = ?';
        await conn.query(query, [fee, event_id]);
    }

    if (categoryIds != null) {
        let query = "delete from event_category where event_id = ?";
        await conn.query(query, event_id);

        for (let i = 0; i < categoryIds.length; i++) {
            query = "insert into event_category (event_id, category_id) values (?,?)";
            await conn.query(query, [event_id, categoryIds[i]]);
        }
    }

    conn.release();
};

exports.delete = async function(event_id) {
    const conn = await db.getPool().getConnection();
    const delete_attendees = "delete from event_attendees where event_id = ?";
    const delete_categories = "delete from event_category where event_id = ?";
    const delete_event = "delete from event where id = ?";
    await conn.query(delete_attendees, event_id);
    await conn.query(delete_categories, event_id);
    await conn.query(delete_event, event_id);
    conn.release();
};

exports.getCategory = async function() {
    const conn = await db.getPool().getConnection();
    const query = "select * from category";
    const [rows] = await conn.query(query);
    conn.release()
    return rows;
};

exports.add = async function(title, desc, categoryIds, date, online, url, venue, capacity, control, fee, id) {

    const conn = await db.getPool().getConnection();
    const query = "insert into event (title, description, date, is_online, url, venue, capacity, requires_attendance_control, fee, organizer_id)" +
        " values (?,?,?,?,?,?,?,?,?,?)";
    const [result] = await conn.query(query, [title, desc, date, online, url, venue, capacity, control, fee, id]);
    const eventId = result.insertId;
    const category_query = "insert into event_category (event_id, category_id) values (?,?)"
    for (let i = 0; i <categoryIds.length; i++) {
        await conn.query(category_query, [eventId, categoryIds[i]]);
    }
    conn.release();
    return eventId;
};