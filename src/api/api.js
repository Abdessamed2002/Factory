var express = require('express');
const { google } = require('googleapis');// google sheet api attributes
const {v4} = require ('uuid');
require('dotenv').config()
var app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

const apiKey = process.env.API_KEY;

app.get('/tasks', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    const taskSheet = await getTasks();
    res.send(taskSheet);
});
app.get('/users', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    const userSheet = await getUsers();
    res.send(userSheet);
});
app.get('/total_number_tasks', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    const numberOfTasks = await getNumberOfTasks();
    res.send({ total : (numberOfTasks - 1).toString()});
});
app.get('/total_number_users', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    const numberOfUsers = await getNumberOfUsers();
    res.send({ total : (numberOfUsers - 1).toString()});
});
app.get('/top_10_users', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    const topUsers = await getTopUsers();
    res.send(topUsers);
});

// req.params refers to items with a ':' in the URL and req.query refers to items associated with the '?'
function isValidDate(dateTimeString) {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    return regex.test(dateTimeString);
}
app.post('/tasks', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }

    const { name, point, startDate, endDate, type, repeat} = req.body;
    // Check if all required fields are present
    if (name && point !== undefined && startDate && endDate && type && repeat !== undefined) {
        if (typeof point !== 'number') {
            return res.status(400).json({ error: "point must be number." });
        }
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({ error: "Start and end dates must be valid date formats." });
        }
        if (type !== 'text' && type !== 'image') {
            return res.status(400).json({ error: "Type must be either 'text' or 'image'." });
        }
        if (repeat !== true && repeat !== false) {
            return res.status(400).json({ error: "Repeat must be either true or false." });
        }
        let uuid = v4();
        await insertTaskSheet(req.body, uuid);
        const taskSheet = await getTasks();
        res.send(taskSheet);
    } else {
        res.status(400).json({ error: "Request is missing one or more required fields." });
    }
});
app.put('/tasks', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are not allowed to get data from this API." });
    }
    await updateTaskSheet(req.body);
    const taskSheet = await getTasks();
    res.send(taskSheet);
});
app.delete('/tasks', async function (req, res) {
    if (req.query.key !== apiKey) {
        return res.status(400).json({ error: "You are bataataaaaaaaaa" });
    }
    const requestId = req.query.id;
    if (!requestId) {
        return res.status(400).json({ error: "Missing id parameter." });
    }
    await deleteTaskSheet(requestId);
    res.end();
});
const clientEmail = ''; // client google sheet email
const privateKey = ''; // client google sheet key
const googleSheetId = ''; // task sheet ID
const googleSheetPage = ''; // task sheet page name
const userSheetID = ''; // user sheet ID
const userSheetName = ''; // user sheet page name
async function authenticate() {
    const client = new google.auth.JWT(
        clientEmail,
        null,
        privateKey.replace(/\\n/g, '\n'),
        'https://www.googleapis.com/auth/spreadsheets'
    );
    await client.authorize();
    return google.sheets({ version: 'v4', auth: client });
}
async function deleteTaskSheet(id) {    
    const sheets = google.sheets('v4');
    try {
        const auth = await google.auth.getClient({
            keyFile: 'credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        // Get the sheet data to find the row index of the specified ID
        const response = await sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: googleSheetId,
            range: googleSheetPage, // Specify the range of your sheet
        });
        const values = response.data.values;
        const rowIndex = values.findIndex(row => row[0] === id.toString()); // Find the index of the row with the specified ID
        if (rowIndex !== -1) {
            // Delete the row if the ID is found
            const deleteResponse = await sheets.spreadsheets.batchUpdate({
                auth: auth,
                spreadsheetId: googleSheetId,
                resource: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: 0,
                                    dimension: 'ROWS',
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1
                                }
                            }
                        }
                    ]
                }
            });
        }
    } catch (error) {
        console.error('Authentication failed:', error);
    }
}
async function getTasks (){
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
    const tasks = []; // Define an array to store tasks
    const response = await fetch(url);
    const data = await response.json();
    for (let i = 1; i < data.values.length; i++) { // Iterate over the values and create task objects
    const taskDetails = data.values[i];
    const startDate = new Date(taskDetails[3]); // Assuming startDate is already defined
    const endDate = new Date(taskDetails[4]); // Assuming startDate is already defined
    const task = {
        id: taskDetails[0],
        name: taskDetails[1],
        point: taskDetails[2],
        startDate: startDate,
        endDate: endDate,
        type: taskDetails[5],
        repeat: taskDetails[6],
        captionText: taskDetails[7]
    };
    tasks.push(task);
    }
    return tasks;
}
async function getNumberOfTasks() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values.length;
}
async function insertTaskSheet(task, id) {
    try {
        const sheets = await authenticate();
        const newRow = [
            id,
            task.name,
            task.point,
            task.startDate,
            task.endDate,
            task.type,
            task.repeat,
            task.captionText
        ];
        const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: googleSheetId,
        range: googleSheetPage,
        valueInputOption: 'RAW',
        resource: { values: [newRow] },
      });
    } catch (error) {
        console.error('Error inserting user:', error);
    }
}  
async function updateTaskSheet(task) {
    try {
        const sheets = await authenticate();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: googleSheetId,
            range: googleSheetPage, 
        });
        const values = response.data.values;
        const newTask = {};
        if (values.length) {
        const updatedValues = values.map(row => {
            if (row[0] === task.id.toString()) {
                if(task.name) { newTask.name = task.name; } else { newTask.name = row[1] }
                if(task.point) { newTask.point = task.point; } else { newTask.point = row[2] }
                if(task.startDate) { newTask.startDate = task.startDate; } else { newTask.startDate = row[3] }
                if(task.endDate) { newTask.endDate = task.endDate; } else { newTask.endDate = row[4] }
                if(task.type) { newTask.type = task.type; } else { newTask.type = row[5] }
                if(task.repeat) { newTask.repeat = task.repeat; } else { newTask.repeat = row[6] }
                if(task.captionText) { newTask.captionText = task.captionText; } else { newTask.captionText = row[7]; }
                return [task.id, newTask.name, newTask.point, newTask.startDate, newTask.endDate, newTask.type, newTask.repeat, newTask.captionText]; // Reorder if necessary
            }
            return row;
        });
        // Update the range with the modified values
        const updateResponse = await sheets.spreadsheets.values.update({
            spreadsheetId: googleSheetId,
            range: googleSheetPage, // Adjust the range here
            valueInputOption: 'RAW',
            resource: { values: updatedValues },
        });
        } else {
            console.log('No data found in the sheet.');
        }
    } catch (error) {
        console.error('Error updating sheet:', error);
    }
}
async function getUsers (){
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${userSheetID}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
    const users = [];
    const response = await fetch(url);
    const data = await response.json();
    for (let i = 1; i < data.values.length; i++) { 
    const taskDetails = data.values[i];
    const userData = {
        userId: taskDetails[0],
        score: taskDetails[1],
        username: taskDetails[2],
        firstName: taskDetails[3],
        lastName: taskDetails[4],
        phoneNumber: taskDetails[5],
        country: taskDetails[6],
        profilePhotos: taskDetails[7]
    };
    users.push(userData);
    }
    return users;
}
async function getNumberOfUsers (){
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${userSheetID}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values.length;
}
async function getTopUsers() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${userSheetID}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
    const users = [];
    const response = await fetch(url);
    const data = await response.json();
    for (let i = 1; i < data.values.length; i++) { 
        const taskDetails = data.values[i];
        const userData = {
            userId: taskDetails[0],
            score: taskDetails[1],
            username: taskDetails[2],
            firstName: taskDetails[3]
        };
        users.push(userData);
    }
    // Sort the users array based on the score in descending order
    users.sort((a, b) => parseInt(b.score) - parseInt(a.score));
    const top10Users = users.slice(0, 10);
    return(top10Users);    
}
app.listen(3001, function () {
  console.log('Example app listening on port 3001 !!!!!!!!');
});