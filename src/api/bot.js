const TelegramBot = require("node-telegram-bot-api");// the main library of telegram bot api
const cron = require('node-cron');// for handle cron expressions every minute
const cronParser = require('cron-parser');// parse the cron expressions to compare them with the current date
const { google } = require('googleapis');// google sheet api attributes
const { parsePhoneNumber } = require('libphonenumber-js');// to get the country code of all phone numbers

const botToken = ""; // your bot token
const bot = new TelegramBot(botToken, { polling: true }); // initiate the bot

bot.on('polling_error', err => console.log(err));

bot.onText(/\/score/, async (msg) => {
  const userId = msg.from?.id;
  let scoreMessage = "your total score is : ";
  const declineMessage = "you are not a member of this initiative";
  const userExists = await checkUserId(userId);
  
  if (userExists) { 
    const score = await getScore(userId);
    scoreMessage += score
    bot.sendMessage(userId, scoreMessage);
  }
  else { bot.sendMessage(userId, declineMessage);}
});

bot.onText(/\/start/, async (msg) => {
  const userId = msg.from?.id;
  const userExists = await checkUserId(userId);
  // check if the user is not currently on the sheet
  if (!userExists) { 
    const { username, first_name: firstName, last_name: lastName } = msg.from;
    let welcomeMessage = " Wlecome ";
    if (lastName) { welcomeMessage += firstName + " " + lastName; } else { welcomeMessage += firstName; }  
    setTimeout(async () => { bot.sendMessage(userId, welcomeMessage); }, 400);

    let userPhotos = [];
    bot.getUserProfilePhotos(userId).then((response) => {
      const photos = response.photos;
      photos.forEach((photo, photoIndex) => { // Iterate through the photos array
        const fileId = photo[2].file_id;
        bot.getFile(fileId).then((fileInfo) => { // Get file information using Telegram Bot API's getFile method
          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;
          userPhotos.push(fileUrl);
        });
      });
    })
    .catch((error) => {
      console.error('Error fetching user profile photos:', error);
    });
    setTimeout(async () => { 
      bot.sendMessage(userId, 'Share your Contact with us', {
        reply_markup: {
            keyboard: [
                [{ text: 'Share contact', request_contact: true }]
            ],
            resize_keyboard: true
        }
      }).then((sentMessage) => {
        bot.once('contact', async (contactMsg) => { // Listen for the contact event once the message is sent
          const phoneNumber = contactMsg.contact.phone_number; // get the phone number
          const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;// Ensure phone number is in the correct format
          const parsedPhoneNumber = parsePhoneNumber(formattedPhoneNumber); // parse the phone number
          let country = '';
          if (parsedPhoneNumber) {
              country = parsedPhoneNumber.country || '';
          }
          const profilePhotosString = userPhotos.join(', '); 
          const userData = {
            userId: userId,
            score: 0,
            username: username,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: formattedPhoneNumber,
            country,
            profilePhotos: profilePhotosString
          };
          insertUser(userData); // Insert user data after all photo URLs are fetched
          bot.sendMessage(userId, ' Glad to see you in our Atqin Bot ', {    reply_markup: {      remove_keyboard: true    }  }); // delete attachement icon
        });
      });
    }, 1000);
  }
  else {
    let deniedMessage = msg.from?.first_name + " you're already connected to the bot";
    bot.sendMessage(userId, deniedMessage);
  }
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

async function checkUserId(id) {
  try {
    const sheets = await authenticate();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: userSheetID,
      range: userSheetName,
    });
    const values = response.data.values;
    if (values.length) {
      // Find the row with the matching ID
      const userRow = values.find(row => row[0] === id.toString());
      if(userRow) {  return true; }
      else {  return false;  }
    }
    else {  return false;  }
  } catch (error) {
    console.error('Error retrieving score:', error);
    return null;
  }
}

async function insertUser(userData) {
  try {
    const sheets = await authenticate();
    const newRow = [
      userData.userId,
      userData.score,
      userData.username,
      userData.firstName,
      userData.lastName,
      userData.phoneNumber,
      userData.country,
      userData.profilePhotos,
    ];
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: userSheetID,
      range: userSheetName,
      valueInputOption: 'RAW',
      resource: { values: [newRow] },
    });
  } catch (error) {
    console.error('Error inserting user:', error);
  }
}

async function updateSheet(id, point) {
  try {
    const sheets = await authenticate();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: userSheetID,
      range: userSheetName, // Adjust the range here
    });
    const values = response.data.values;
    if (values.length) {
      const updatedValues = values.map(row => {
        if (row[0] === id.toString()) {
          const updatedScore = parseInt(row[1]) + parseInt(point);
          return [id.toString(), parseInt(updatedScore)]; // Reorder if necessary
        }
        return row;
      });
      // Update the range with the modified values
      const updateResponse = await sheets.spreadsheets.values.update({
        spreadsheetId: userSheetID,
        range: userSheetName, // Adjust the range here
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
async function getScore(id) {
  try {
    const sheets = await authenticate();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: userSheetID,
      range: userSheetName,
    });
    const values = response.data.values;
    if (values.length) {
      // Find the row with the matching ID
      const userRow = values.find(row => row[0] === id.toString());
      return userRow[1];
    }
  } catch (error) {
    console.error('Error retrieving score:', error);
    return null;
  }
}
async function getUsers() {
  try {
    const sheets = await authenticate();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: userSheetID,
      range: userSheetName,
    });
    const values = response.data.values;
    if (values.length > 1) { // Check if there are values (excluding header)
      return values.slice(1).map(row => parseInt(row[0])); // Convert IDs to integers
    } else {
      return []; // Return an empty array if no user IDs are found
    }
  } catch (error) {
    console.error('Error retrieving score:', error);
    return null;
  }
}
// CronJob
function dateTimeMatches(date, currentDate) {
  const currentDateS = currentDate.toISOString().substring(0, 16);// Truncate seconds and milliseconds
  const dateS = date.toISOString().substring(0, 16);
  return dateS === currentDateS; // Check if the current date and time matches any date and time in the list
}
function timeMatches(expression, date) {
  const interval = cronParser.parseExpression(expression);
  const data = interval.fields;
  if (!data.minute.includes(date.getMinutes())) {
    return false;
  }
  if (!data.hour.includes(date.getHours())) {
    return false;
  }
  if (!data.dayOfMonth.includes(date.getDate())) {
    return false;
  }
  if (!data.month.includes(date.getMonth() + 1)) {
    return false;
  }
  if (!data.dayOfWeek.includes(date.getDay())) {
    return false;
  }
  return true;
}
function timeMatchesRepeat(expression, date) {
  const interval = cronParser.parseExpression(expression);
  const data = interval.fields;
  if (!data.minute.includes(date.getMinutes())) {
    return false;
  }
  if (!data.hour.includes(date.getHours())) {
    return false;
  }
  return true;
}
function dateToCronExpression(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const cronExpression = `${minute} ${hour} * * *`;
  return cronExpression;
}

cron.schedule('* * * * *', async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetId}/values/A:H?key=AIzaSyAKKxJPhThyaV0XGuW9wITrhiGRsud65gU`;
  const tasks = []; // Define an array to store tasks
  const repeatedTasks = {} // Dict for repeated tasks
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
  // call a function how give you all usersIDs  // make them on a list
  let trackedUsers = await getUsers();
  
  tasks.forEach(task => {
    if (task.repeat == "TRUE") {
      const cronExpression = dateToCronExpression(task.startDate);
      repeatedTasks[cronExpression] = [task.name, task.type ,task.point, task.endDate, task.captionText];
    }
  })

  const currentDate = new Date();
  Object.keys(repeatedTasks).forEach(cronExpression => {
    if (timeMatchesRepeat((cronExpression), currentDate)) { 
      const date = repeatedTasks[cronExpression][3].toISOString();
      const point = repeatedTasks[cronExpression][2];
      if(repeatedTasks[cronExpression][1] == 'image') {
        trackedUsers.forEach(userId => {
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Done', callback_data: `done_${date}_${point}` }]
              ]
            }
          };
          bot.sendPhoto(userId, repeatedTasks[cronExpression][0], { ...options, caption: repeatedTasks[cronExpression][4] });
        });
      }
      if(repeatedTasks[cronExpression][1] == 'text') {
        trackedUsers.forEach(userId => {
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Done', callback_data: `done_${date}_${point}` }]
              ]
            }
          };
          bot.sendMessage(userId, repeatedTasks[cronExpression][0], options);
        });
      }
    }
  });

  tasks.forEach(task => {
    if (dateTimeMatches(task.startDate, currentDate) && task.repeat === "FALSE") {
      const date = task.endDate.toISOString();
      const point = task.point;
      if (task.type == 'image') {
        trackedUsers.forEach(userId => {
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Done', callback_data: `done_${date}_${point}` }]
              ]
            }
          };
          bot.sendPhoto(userId, task.name, { ...options, caption: task.captionText });
        });
      }
      else if (task.type == 'text') {
        trackedUsers.forEach(userId => {
          const options = {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Done', callback_data: `done_${date}_${point}` }]
              ]
            }
          };
          bot.sendMessage(userId, task.name, options);
        });
      }
    }
  })
});
// Listen for button clicks
bot.on('callback_query', async (callbackQuery) => {
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  const currentDate = new Date();
  const taskDateEnd = new Date(data.split('_')[1]);
  const point = data.split('_')[2];
  //console.log("date maintenant : ", currentDate);
  //console.log("date task end : ", taskDateEnd);
  if (data.startsWith('done_')) { 
    const options = {
      reply_markup: JSON.stringify({
        remove_keyboard: true
      })
    };
    bot.editMessageReplyMarkup({}, {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      reply_markup: options.reply_markup
    });

    if (currentDate > taskDateEnd) {
      const messageText = 'Sorry, the time is depassed for this task.';
      bot.sendMessage(callbackQuery.message.chat.id, messageText);
    }
    else {
      await updateSheet(userId, point);
      const messageText = ' Perfect, You have finished the task!';
      bot.sendMessage(callbackQuery.message.chat.id, messageText);
    }
  }
});