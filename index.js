const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');

const app = express();

app.enable('trust proxy');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

let DB = `mongodb+srv://mkj:<password>@cluster0.yye3jcz.mongodb.net/?retryWrites=true&w=majority`;
let password = '5LNFncgUIevGrq18';

DB = DB.replace('<password>', password);

mongoose.connect(DB, {}).then(() => {
  console.log('Connection Successful');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}`);
});

// Assuming the Country schema is in a separate file (./model/countryModel)
const Country = require('./model/countryModel');

app.post('/upload', upload.single('csvFile'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const data = file.buffer.toString(); // Assuming the file is in CSV format

    const results = [];

    const lines = data.split('\r\n'); // Changed from '\n' to '\r\n' for Windows-style line endings
    const headers = lines[0].split(',');

    // Define the required fields here
    const requiredFields = ['Country_Name', 'Country_two_letter_Code', 'Currency_Code', 'Phone_Code'];

    // Check if all required fields are present in the headers
    if (!requiredFields.every(field => headers.includes(field))) {
        return res.status(400).send('The file does not contain all required fields');
    }

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const result = {};

        for (let j = 0; j < headers.length; j++) {
            result[headers[j].trim()] = values[j] ? values[j].trim() : '';
        }

        results.push(result);
    }

    try {
        for (const row of results) {
            const { Country_Name, Country_two_letter_Code, Currency_Code, Phone_Code } = row;
            const existingCountry = await Country.findOne({
                Country_Name,
                Country_two_letter_Code,
                Currency_Code,
                Phone_Code,
            });

            if (!existingCountry) {
                // Check if result has any non-empty values before creating a new entry
                if (Object.values(row).some(val => val !== '')) {
                    await Country.create({
                        Country_Name,
                        Country_two_letter_Code,
                        Currency_Code,
                        Phone_Code,
                    });
                }
            }
        }

        console.log('File processing complete');
        res.send('File uploaded and data processed');
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});

  
