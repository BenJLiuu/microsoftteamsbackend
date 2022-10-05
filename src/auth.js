import { getData, setData } from './dataStore.js';
import validator from 'validator';

/**
  * Logs in a user and returns their user Id.
  * 
  * @ param {string} email - the users' email
  * @ param {string} password - the users' password, unencrypted
  * ...
  * 
  * @ returns {authUserId : integer} - If login is successful
  * @ returns {error : 'Incorrect Password.'} - If email is found, but password is incorrect
  * @ returns {error : 'Email Not Found.'} - If email was not found.
*/

function authLoginV1(email, password) {
  const data = getData();
  for (const user of data.users) {

    if (user.email === email) {
      // Found an email match
      if (user.passwordHash === password) {
        return {
          authUserId: user.uId,
        }
      } else {
        // Email found, but password was incorrect
        return {
          error: 'Incorrect Password.' 
        }
      }
    }

  }
  // If nothing has been returned, user has not been found.
  return {
    error: 'Email Not Found.' 
  }
}

//Returns true if a character in a string is a number 
function isNumber(char) {
  return /^\d$/.test(char);
}

/**
  * Registers a user and returns their user Id.
  * Also generates a unique user handle.
  *
  * @ param {string} email - the user's email address
  * @ param {string} password - the user's password
  * @ param {string} nameFirst - the user's first name
  * @ param {string} nameLast - the user's last name
  *
  * @ returns {AuthUserId: integer} - if registration is successfull
  * @ returns {error: 'Invalid Email Address.'} - if email inputted is invalid
  * @ returns {error: 'Email Already in Use.'} - if email is already in data
  * @ returns {error: 'Password too Short.'} - if password is <6 characters
  * @ returns {error: Invalid First Name.'} - if first name is too short/long
  * @ returns {error: Invalid Last Name.'} - if last name is too short/long
*/

function authRegisterV1(email, password, nameFirst, nameLast) {
  const data = getData();
  
  if (validator.isEmail(email) === false) {
    return {
      error: 'Invalid Email Address.'
    }
  }
  
  for (const user of data.users) {
    if (user.email === email) {
      return {
        error: 'Email Already in Use.'
      }
    }
  }
  
  if (password.length < 6) {
    return {
      error: 'Password too Short.'
    }
  }
  
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return {
      error: 'Invalid First Name.'
    }
  }
  
  if (nameLast.length < 1 || nameLast.length > 50) {
    return {
      error: 'Invalid Last Name.'
    }
  }
  

  let newUId = new Date().getTime();
  for (const user of data.users) {
    if (newUId === user.uId) {
      newUId = newUId + Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
    }
  }
  
  let handleString = nameFirst + nameLast;
  handleString = handleString.toLowerCase();
  handleString = handleString.replace(/[^a-z0-9]/gi, '');
  if (handleString.length > 20) {
    handleString = handleString.substring(0,20);
  }
  
  let i = 0;
  let doesNotExist = false;
  
  for (const user of data.users) {
    if (handleString === user.handleStr) {
      i = 0;
    } else if ((handleString === user.handleStr.substring(0,handleString.length) === true) && (isNumber(user.handleStr[user.handleStr.length - 1]) === true)) {
      i++;
    } else {
      doesNotExist = true;
    }
  }
  
  if (i === 0 && doesNotExist === true) {
    handleString = handleString;
  } else if (i === 0) {
    handleString += '0';
  } else if (i > 0) {
    handleString += i;
  }
  
  const newUser = {
    uId: newUId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleString,
    passwordHash: password
  }
  
  data.users.push(newUser);
  setData(data);
  
  return {
    authUserId: data.users[data.users.length - 1].uId
  }
}

export { authLoginV1, authRegisterV1 }
