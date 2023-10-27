const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    Country_Name: {
        type: String,

    },
    Country_two_letter_Code: {
        type: String,

    },
    Currency_Code: {
        type: String,

    },
    Phone_Code: {
        type: String,

    }
});


const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
