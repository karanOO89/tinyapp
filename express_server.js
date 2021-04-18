const {
  getUserByEmail,
  generateRandomString,
  generateRandomID,
  loginLookup,
  findIdByEmail,
  getShortUrlById,
  getEmailByUserId,
  bcrypt,
} = require("./helpers");

const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookie = require("cookie-session");
const PORT = 8080;
const morganMiddleware = morgan("dev");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookie({
    name: "session",
    keys: ["key1"],
  })
);

app.set("view engine", "ejs");
app.use(morganMiddleware);

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
};
const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10),
  },
};
//-------------Registration--------------------
app.get("/userReg", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    const templateVars = { user: user };
    return res.render("user_registration", templateVars);
  } else {
    return res
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
    return res.status(400).send("Enter Valid Credentials"); //=> credential & email lookup in database
  }
  if (getUserByEmail(email, users)) {
    //=> to find user existence in users database

    return res.status(400).send("Email Already Exists");
  }
  let id = generateRandomID();
  users[id] = { id: id, email: email, password: password };
  req.session["user_id"] = id;
  return res.redirect("/urls");
});

//-------------Login--------------------
app.get("/userLogin", (req, res) => {
  const user = req.session["user_id"];
  if (!user) {
    const templateVars = { user: "" };
    return res.render("user_login", templateVars);
  } else {
    return res.status(400).send("You are already loggedIn");
  }
});

app.post("/userLogin", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400).send("Enter Valid Credentials");
  }
  if (!loginLookup(email, password, users)) {
    //=> to verify whether user exists in users database or not
    return res.status(400).send("Either Email Or Password Is Incorrect");
  }
  const id = findIdByEmail(email, users); //=> extracting id by email from users database
  req.session["user_id"] = id;
  return res.redirect("/urls");
});

//-------------Urls main--------------------
app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId, users); //=> finding email via userID
  const url = getShortUrlById(userId, urlDatabase); //=> extracting shorturl from urldatabase by id
  if (userId) {
    const templateVars = { urls: url, user: user };
    return res.render("urls_index", templateVars);
  } else {
    return res.status(403).send("Login To Access This Page");
  }
});
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, userID };

  return res.redirect(`/urls`);
});

//-------------Urls/ new creation--------------------
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId, users); //=> finding email via userID

  if (userId) {
    const templateVars = { user: user };
    return res.render("urls_new", templateVars);
  }
  return res.status(403).send("Login To Access This Page");
});

//-------------Url short redirection for updation --------------------
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId, users); //=> finding email via userID
  if (urlDatabase[req.params.shortURL]["userID"] === userId) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: user,
    };
    return res.render("urls_show", templateVars);
  }
  return res.status(403).send("Login To Access This Page");
});
app.post("/urls/:shortURL/update", (req, res) => {
  const toUpdateUrl = req.body.longURL;
  urlDatabase[req.params.shortURL]["longURL"] = toUpdateUrl;

  return res.redirect("/urls");
});

//-------------/u/shorturl--------------------
app.get("/u/:shortURL", (req, res) => {
  //=> extracting the original long url from database

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  return res.redirect(longURL);
});

//-------------delete Method--------------------
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  return res.redirect("/urls");
});

//-------------logout--------------------
app.post("/logout", (req, res) => {
  req.session = null;

  return res.redirect("/");
});
//-------------homepage ("/")--------------------
app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  const user = getEmailByUserId(userId, users); //=> finding email via userID

  const urls = {};
  for (let ele in urlDatabase) {
    urls[ele] = urlDatabase[ele]["longURL"];
  }
  if (userId) {
    const templateVars = { urls: urls, user: user };
    return res.render("urls_index", templateVars);
  } else {
    return res.redirect("/userLogin");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
