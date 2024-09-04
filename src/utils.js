const { v4: uuidv4 } = require('uuid');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const csv = require('csv-parser');
const fs = require('fs');
const { processAndSaveData } = require('./db');

const standartizeData = (obj) => {
    const phoneNumber = obj.phone;
    const emailAdress = obj.email;
    const uuid = uuidv4();

    if (!phoneNumber) {
        throw new Error('Null phone field');
    }
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, 'RU');
    if (!parsedNumber && !parsedNumber.isValid() && !parsedNumber.country === 'RU') {
        throw new Error('Invalid phone number or not a Russian number');
    }

    let parsedEmail = emailAdress.trim();
    if (emailAdress.endsWith('.')) {
        parsedEmail = emailAdress.slice(0, -1);
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(parsedEmail)) {
        throw new Error('Invalid email format.');
    }
    return { ...obj, phone: `7${parsedNumber.nationalNumber}`, id: uuid, email: parsedEmail }
}

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

const processObjects = (users) => {
    let usersData = users.map((item) => standartizeData(item));
    processAndSaveData(usersData);
}

const processFile = (filePath) => {
    parseCSV(filePath).then(data => {
        let usersData = data.map((item) => standartizeData(item));
        processAndSaveData(usersData);
    })
        .catch(error => {
            console.error('Error reading CSV file:', error);
        });;
}

module.exports = { standartizeData, parseCSV, processObjects, processFile };