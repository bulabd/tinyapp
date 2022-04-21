const { assert, expect } = require('chai');

const { findUserByEmail, generateRandomString, userURLs } = require('../helpers.js');

const testUsers = {
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

describe('findUserByEmail', function() {

  it('should return a user with valid email', function() {
    const user = findUserByEmail('user@example.com', testUsers).id;
    const expectedUserID = 'userRandomID';
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if the specified email is not in the database', function() {
    const user = findUserByEmail('user3@example.com', testUsers);
    const expectedUserID = undefined;
    assert.strictEqual(user, expectedUserID);
  });

});

describe('generateRandomString', function() {

  it('should return a string', function () {
    const randomStringType = typeof generateRandomString();
    assert.strictEqual(randomStringType, 'string');
  });

  it('should return a string of length 6', function() {
    const randomStringLength = generateRandomString().length;
    assert.strictEqual(randomStringLength, 6);
  });

});

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

describe('userURLs', function() {

  it('should return an object containing the urls of the specified ID', function() {
    const URLsObject = userURLs('aJ48lw', urlDatabase);
    const expectedURLsObj = {
      'b2xVn2': "http://www.lighthouselabs.ca",
      '9sm5xK': "http://www.google.com"
    };
    expect(URLsObject).to.eql(expectedURLsObj);
  });

});