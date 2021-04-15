const express = require("express");
const app = express();
const morgan = require("morgan");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

let cookie = require("cookie-parser");
app.use(cookie());

const PORT = 8080;
app.set("view engine", "ejs");

const morganMiddleware = morgan("dev");
app.use(morganMiddleware);

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
  for (let key in users) {
    if (users[key]["email"] === email && users[key]["password"] === pass)
      return true;
  }

  return false;
}

function emailLookup(email, pass) {
  for (let key in users) {
    if (users[key]["email"] === email) return "exist";
  }

  return true;
}
function findIdByEmail(email) {
  for (let key in users) {
    // console.log("hello there:",users[key]["id"]);
    if (users[key]["email"] === email) {
      // console.log("key tracer:",users[key].id)
      return users[key].id
    }
  }
}
function getShortUrlById(userId){
  let keys = Object.keys(urlDatabase)
  let obj ={};
for (let uid of keys){
  if (urlDatabase[uid]["userID"] === userId){
    // return uid
    obj[uid]=urlDatabase[uid]["longURL"]
  }
}
return obj;
}
function getEmailByUserId(userId){
for (let id in users){
  if(users[id]["id"] === userId){
    return users[id]["email"];
  }
}
}
// function getmailId(userId){
//   let keys = Object.keys(urlDatabase)
//   let obj ={};
// for (let uid of keys){
//   if (urlDatabase[uid]["userID"] === userId){
//     // return uid
//     obj[uid]=urlDatabase[uid]["longURL"]
//   }
// }
// return obj;
// }


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48l" }
};
const users = {
  userRandomID: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/userReg", (req, res) => {
  const user = req.cookies["user_id"];
  templateVars={ user : user}
  res.render("user_registration", templateVars);
});
app.post("/userReg", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send("Enter Valid Credentials"); //=> credential & email lookup in database
  }

  if (emailLookup(email, password) === "exist") {
    res.status(400).send("Email Already Exists");
  }
  let id = generateRandomID();
  (users[id] = {
    id: id,
    email: email,
    password: password,
  }),
    res.cookie("user_id", id);
  res.redirect("/urls");
});
app.get("/userLogin", (req, res) => {
  const user = req.cookies["user_id"];
  templateVars={ user : ""}
  res.render("user_login",templateVars);
});

app.post("/userLogin", (req, res) => {
console.log(req.body)
  const email = req.body.email.trim();
  const password = req.body.password;
  // console.log(email);
  if (email === "" || password === "") {
    res.status(400).send("Enter Valid Credentials"); //=> credential & email lookup in database
  }
  if (!loginLookup(email, password)) {
    res.status(400).send("Either Email Or Password Is Incorrect");
  }
  const id = findIdByEmail(email);
  // console.log("key tracer:",id)
  // const id = user[]
  res.cookie("user_id", id);
  res.redirect("/urls");
});
// app.post("/login", (req, res) => {
// });

//user registration

app.get("/urls", (req, res) => {
  // console.log(req.cookies["user_id"])
  const userId = req.cookies["user_id"];
  // console.log(req.cookies)
  const user = getEmailByUserId(userId);
  const url = getShortUrlById(userId)
  // console.log(">>>> ",url);
  // if(userId = )
  if( userId ){
  const templateVars = { urls: url, user: user };
  console.log("> ",templateVars);

  res.render("urls_index", templateVars);
  }
  res.status(403).send("not authorized action")
  
});
app.post("/urls", (req, res) => {
  //=>main url pages
  // console.log("..",req.body)
  const userID = req.cookies["user_id"];
  // console.log(req.cookies)
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] ={longURL,userID};

  console.log(urlDatabase); // Log the POST request body to the console

  res.redirect(`/urls`); // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = getEmailByUserId(userId);

  // console.log(">>>>",req.params)
  if( userId ){
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
  }
  res.status(403).send("not authorized action")
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  const userId = req.cookies["user_id"];
  const user = getEmailByUserId(userId);
  if(urlDatabase[req.params.shortURL]["userID"] === userId ){
  console.log(req.params)
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: user,
  };
  // console.log(">>>:",templateVars)
  res.render("urls_show", templateVars);
  // res.redirect(urlDatabase[req.params.longURL]);
}
res.status(403).send("not authorized action")
});
app.post("/urls/:shortURL/update", (req, res) => {
  //=> added update method
  // const userId = req.cookies["user_id"];
  // const user = userId;
// console.log(req.body.longURL)
  const toUpdateUrl = req.body.longURL;
  urlDatabase[req.params.shortURL]["longURL"] = toUpdateUrl;
// console.log(urlDatabase)
  res.redirect("/urls");
});

// app.get("/u/:longURL", (req, res) => {
//   //=> extracting the original long url from database
// console.log("jkjkj",req.body)
//   const longURL = urlDatabase[req.params.shortURL];
//   console.log(req.params.shortURL);
//   res.redirect(longURL);
// });

app.post("/urls/:shortURL/delete", (req, res) => {
  //=> added delete method

  const urlToDelete = req.params.shortURL;
  console.log(urlToDelete);
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // const username = req.params.username;
  res.clearCookie("user_id");

  res.redirect("/userLogin");
});
// app.get("/", (req, res) => {
//   // const user = req.cookies["user_id"];
//   // // console.log(">>>>",user)
  
//   // templateVars={ user : user}
//   // res.render("user_login",templateVars);
//   res.redirect("/userLogin");
// })
app.get("/", (req, res) => {
  const userId = req.cookies["user_id"];
  // console.log(req.cookies)
  // const user = getEmailByUserId(userId);
  const urls = {};
  for (let ele in urlDatabase){
    urls[ele] = urlDatabase[ele]["longURL"]

  }
    const templateVars = { urls: urls ,user : ""}
  // console.log(">>>> ",url);
  // if(userId = )
  // console.log("> ",templateVars);

  res.render("home",templateVars);  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
