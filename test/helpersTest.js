const users = require

const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers["userRandomID"];
    // Write your assert statement here
    console.log(expectedOutput,user)
    assert.deepEqual(expectedOutput,user)
  });
});
  describe('getUserByEmail', function() {
    it('should return undefined', function() {
      const user = getUserByEmail("user@exaple.com", testUsers)
      const expectedOutput = false;
      // Write your assert statement here
    //   console.log(expectedOutput,user)
      assert.equal(expectedOutput,user)
    });

  
});