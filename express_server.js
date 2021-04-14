function generateRandomString() {
  let result = "";
  const length = 6;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.get("/urls", (req, res) => {
  const username = req.cookies.user;
  // console.log(req.cookies)

  const templateVars = { urls: urlDatabase, username: username };

  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const username = req.cookies.user;
  const templateVars = { username: username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  const username = req.cookies.user;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username,
  };
  res.render("urls_show", templateVars);
  // res.redirect(urlDatabase[req.params.longURL]);
});
app.post("/urls", (req, res) => {
  //=>main url pages
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;

  // console.log(urlDatabase); // Log the POST request body to the console

  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  //=> extracting the original long url from database

  const longURL = urlDatabase[req.params.shortURL];
  console.log(req.params.shortURL);
  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  const username = req.body.username.trim();
  res.cookie("user", username);

  res.redirect("/urls");
});
app.post("/logout/:username", (req, res) => {
  const username =req.params.username;
  res.clearCookie("user", username);

  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  //=> added update method
  const toUpdateUrl = req.body.longURL;
  urlDatabase[req.params.shortURL] = toUpdateUrl;

  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  //=> added delete method

  const urlToDelete = req.params.shortURL;
  console.log(urlToDelete);
  delete urlDatabase[urlToDelete];
  res.redirect("/urls");
});
// app.get('*', (req, res) => {
//   res.send('caught by the catchall route');
// });

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
