import { getData, setData } from './dataStore';
import { LoginData, Error } from './objects';
import validator from 'validator';

/**
  * Logs in a user and returns their user Id.
  *
  * @param {string} email - the users' email
  * @param {string} password - the users' password, unencrypted
  * ...
  *
  * @returns {authUserId : integer} - If login is successful
  * @returns {error : 'Incorrect Password.'} - If email is found, but password is incorrect
  * @returns {error : 'Email Not Found.'} - If email was not found.
*/
function authLoginV1(email: string, password: string): LoginData | Error {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      // Found an email match
      if (user.passwordHash === password) return { authUserId: user.uId };
      else return { error: 'Incorrect Password.' };
    }
  }
  // If nothing has been returned, user has not been found.
  return {
    error: 'Email Not Found.'
  };
}

/**
 * Generates a token for a user and assigns it to one of their sessions.
 * 
 * @param uId - the user to log the session to
 * @return the token for that user in an object.
 */
function generateToken(uId: number): {token: string} {
  const tokenLength = 32;

  let token = {
    token: genRandomString(tokenLength),
  };

  const data = getData();
  const userIndex = data.users.findIndex(user => user.uId === uId);
  data.users[userIndex].sessions.push(token);

  setData(data);
  return token;
}

// Random string function from https://tecadmin.net/generate-random-string-in-javascript/
function genRandomString(length: number): string {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  var charLength = chars.length;
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}



/**
  * Registers a user and returns their new user Id.
  * Also generates a unique user handle.
  *
  * @param {string} email - the user's email address
  * @param {string} password - the user's password
  * @param {string} nameFirst - the user's first name
  * @param {string} nameLast - the user's last name
  *
  * @returns {authUserId: integer} - if registration is successfull
  * @returns {error: 'Invalid Email Address.'} - if email is invalid (fails validator.isEmail)
  * @returns {error: 'Email Already in Use.'} - if email is already in data
  * @returns {error: 'Password too Short.'} - if password is <6 characters
  * @returns {error: Invalid First Name.'} - if first name is too short/long
  * @returns {error: Invalid Last Name.'} - if last name is too short/long
*/

function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): LoginData | Error {
  const data = getData();

  if (validator.isEmail(email) === false) {
    return {
      error: 'Invalid Email Address.'
    };
  }

  for (const user of data.users) {
    if (user.email === email) {
      return {
        error: 'Email Already in Use.'
      };
    }
  }

  if (password.length < 6) {
    return {
      error: 'Password too Short.'
    };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return {
      error: 'Invalid First Name.'
    };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return {
      error: 'Invalid Last Name.'
    };
  }

  if (/[^a-zA-Z]/.test(nameFirst)) return { error: 'Invalid First Name.' };
  if (/[^a-zA-Z]/.test(nameLast)) return { error: 'Invalid Last Name.' };

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
    handleString = handleString.substring(0, 20);
  }

  let i = 0;
  let HandleStringExists = false;

  for (const user of data.users) {
    if (handleString === user.handleStr) {
      i = 0;
      HandleStringExists = true;
    } else if ((handleString === user.handleStr.substring(0, handleString.length) === true) && (isNumber(user.handleStr[user.handleStr.length - 1]) === true)) {
      i++;
    }
  }

  if (HandleStringExists) {
    handleString += i;
  }

  const newUser = {
    uId: newUId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleString,
    passwordHash: password
  };

  data.users.push(newUser);
  setData(data);

  return {
    authUserId: data.users[data.users.length - 1].uId
  };
}

// Returns true if a character in a string is a number
function isNumber(char: string): boolean {
  return /^\d$/.test(char);
}

export { authLoginV1, authRegisterV1 };
