const bcrypt = require("bcrypt");

const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
  return false;
};

const generateRandomString = () => {
  let result = "";
  const length = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const generateRandomID = () => {
  let result = "";
  const length = 2;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const loginLookup = (email, pass,users) => {
  const user = getUserByEmail(email, users);
  return user && bcrypt.compareSync(pass, user["password"]);
};

const findIdByEmail = (email,users) => {
  const user = getUserByEmail(email, users);
  if (user) return user["id"];
};

const getShortUrlById = (userId,urlDatabase) => {
  let keys = Object.keys(urlDatabase);
  let obj = {};
  for (let uid of keys) {
    if (urlDatabase[uid]["userID"] === userId) {
      obj[uid] = urlDatabase[uid]["longURL"];
    }
  }
  return obj;
};

const getEmailByUserId = (userId,users) => {
  for (let id in users) {
    if (users[id]["id"] === userId) {
      return users[id]["email"];
    }
  }
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  generateRandomID,
  loginLookup,
  findIdByEmail,
  getShortUrlById,
  getEmailByUserId,
  bcrypt
};