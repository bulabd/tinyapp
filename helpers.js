const generateRandomString = () => {
  let numbersLetters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let finalStr = '';
  for (let i = 0; i < 6; i++) {
    finalStr += numbersLetters[Math.floor(Math.random() * 35)];
  }
  return finalStr;
};

const findUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

const userURLs = (userID, database) => {
  let URLsObject = {};
  for (let url in database) {
    if (database[url].userID === userID) {
      URLsObject[url] = database[url].longURL;
    }
  }
  return URLsObject;
};

module.exports = {
  findUserByEmail,
  generateRandomString,
  userURLs
};