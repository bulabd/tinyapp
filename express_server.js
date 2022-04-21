const {generateRandomString, findUserByEmail, userURLs} = require('./helpers');
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.use(cookieSession({
  name: 'session',
  keys: ['Hello there!']
}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aJ48lw'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'aJ48lw'
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: userURLs(req.session.user_id, urlDatabase), // object of user's URLs
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user === undefined) {
    return res.redirect('/login');
  } else {
    let newShortURL = generateRandomString();
    urlDatabase[newShortURL] = {      // add a new URL for a user
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${newShortURL}`);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {  // create new URL page
  if (req.session.user_id) {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: userURLs(req.session.user_id, urlDatabase)[req.params.shortURL],
    user: users[req.session.user_id]
  };
  if (!(req.params.shortURL in urlDatabase)) { // if URL not in database
    res.status(404);
    res.send('<h1>Error: URL does not exist</h1>');
  } else {
    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      res.render('urls_show', templateVars);
    } else {
      if (req.session.user_id && urlDatabase[req.params.shortURL].userID !== req.session.user_id) { // if another user tries to access not his owned URL
        res.status(403);
        res.send('<h1>Error: Cannot access someone else\'s URL</h1>');
      } else {
        res.status(401);
        res.send('<h1>Error: Please login first</h1>');
      }
    }
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) { // if right user, can modify URL
    urlDatabase[shortURL].longURL = longURL;
  }
  res.redirect('/urls');
});

app.get('/urls/:shortURL/delete', (req, res) => { // only the user can delete URL
  if (!req.session.user_id) {
    res.status(401);
    res.send('<h1>Error: Please login first</h1>');
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403);
    res.send('<h1>Error: Cannot access someone else\'s URL</h1>');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) { // only user can delete URL
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => { // short URL links to website
  const longURLObj = urlDatabase[req.params.shortURL];
  if (longURLObj) {
    return res.redirect(longURLObj.longURL);
  } else {
    res.status(404);
    res.send('<h1>Error: URL does not exist</h1>');
  }
});

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  if (userID != null) {  // logged user cannot login again
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {
    if (bcrypt.compareSync(req.body.password, foundUser.password)) {
      req.session.user_id = foundUser.id;
      return res.redirect('/urls');
    } else {
      res.status(403);
      res.send('<h1>Wrong password</h1>');
    }
  } else {
    res.status(403);
    res.send('<h1>Could not find User</h1>');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID != null) { // registered and logged user cannot register again
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let newUserId = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('<h1>Your email and/or password is empty.</h1>');
  } else if (findUserByEmail(req.body.email, users)) {
    res.status(400);
    res.send('<h1>An account with this email already exists.</h1>');
  } else {
    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = newUserId;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});