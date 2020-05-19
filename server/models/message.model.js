const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    _id_room: {
        type: String
    },
    sender: String,
    sender_name: String,
    receiver: String,
    content: String,
    status: Boolean

});

mongoose.model('Message', messageSchema);