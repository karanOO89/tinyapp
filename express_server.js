const express = require("express");
const app = express();
const morgan = require("morgan");
const { getUserByEmail } = require("./helpers");
const bodyParser = require("body-parser");
const cookie = require("cookie-session");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookie({
    name: "session",
    keys: ["key1"],
  })
);

const PORT = 8080;
app.set("view engine", "ejs");

const morganMiddleware = morgan("dev");
app.use(morganMiddleware);
const bcrypt = require("bcrypt");

function generateRandomString() {
  let result = "";
  const length = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
function generateRandomID() {
  let result = "";
  const length = 2;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function loginLookup(email, pass) {
  const user = getUserByEmail(email, users);
  return user && bcrypt.compareSync(pass, user["password"]);
}
function findIdByEmail(email) {
  const user = getUserByEmail(email, users);
  if (user) return user["id"];
}
function getShortUrlById(userId) {
  let keys = Object.keys(urlDatabase);
  let obj = {};
  for (let uid of keys) {
    if (urlDatabase[uid]["userID"] === userId) {
      obj[uid] = urlDatabase[uid]["longURL"];
    }
  }
  return obj;
}
function getEmailByUserId(userId) {
  for (let id in users) {
    if (users[id]["id"] === userId) {
      return users[id]["email"];
    }
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48l" },
};
const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
};

app.get("/userReg", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    templateVars = { user: user };
    res.render("user_registration", templateVars);
  } else {
    res
      .status(400)
      .send(
        "You are already loggedIn, please logout and click register for new registration"
      );
  }
});
app.post("/userReg", (req, res) => {
  let email = req.body.email;

  let Password = req.body.password;

  const password = bcrypt.hashSync(Password, 10);

  if (email === "" || password === "") {
    res.status(400).send("Enter Valid Credentials"); //=> credential & email lookup in database
  }

  if (getUserByEmail(email)) {
    res.status(400).send("Email Already Exists");
  }
  let id = generateRandomID();
  users[id] = { id: id, email: email, password: password };
  req.session["user_id"] = id;
  res.redirect("/urls");
});
app.get("/userLogin", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    templateVars = { user: "" };
    res.render("user_login", templateVars);
  } else {
    res.status(400).send("You are already loggedIn");
  }
});

app.post("/userLogin", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send("Enter Valid Credentials"); //=> credential & email lookup in database
  }
  if (!loginLookup(email, password)) {
    res.status(400).send("Either Email Or Password Is Incorrect");
  }
  const id = findIdByEmail(email);
  req.session["user_id"] = id;
  res.redirect("/urls");
});

//user registration

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId);
  const url = getShortUrlById(userId);
  if (userId) {
    const templateVars = { urls: url, user: user };

    res.render("urls_index", templateVars);
  }
  res.status(403).send("Login To Access This Page");
});
app.post("/urls", (req, res) => {
  //=>main url pages
  const userID = req.session["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };

  res.redirect(`/urls`);
});
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId);

  if (userId) {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  }
  res.status(403).send("Login To Access This Page");
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId);
  if (urlDatabase[req.params.shortURL]["userID"] === userId) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: user,
    };
    res.render("urls_show", templateVars);
  }
  res.status(403).send("Login To Access This Page");
});
app.post("/urls/:shortURL/update", (req, res) => {
  //=> added update method
  const toUpdateUrl = req.body.longURL;
  urlDatabase[req.params.shortURL]["longURL"] = toUpdateUrl;

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  //=> extracting the original long url from database

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //=> added delete method

  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/");
});

app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId);

  const urls = {};
  for (let ele in urlDatabase) {
    urls[ele] = urlDatabase[ele]["longURL"];
  }
  const templateVars = { urls: urls, user: user };
  res.render("home", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
