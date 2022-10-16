import { getData, setData } from './dataStore';
import { AuthUserId, LoginData, Error } from './objects';
import validator from 'validator';
import { generateSession } from './helper';

/**
  * Logs in a user and returns their user Id.
  *
  * @param {string} email - the users' email
  * @param {string} password - the users' password, unencrypted
  * ...
  *
  * @returns {Object} {authUserId, token} - If login is successful
  * @returns {Object} {error : 'Incorrect Password.'} - If email is found, but password is incorrect
  * @returns {Object} {error : 'Email Not Found.'} - If email was not found.
*/
function authLoginV2(email: string, password: string): LoginData | Error {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      // Found an email match
      if (user.passwordHash === password) return generateSession(user.uId);
      else return { error: 'Incorrect Password.' };
    }
  }
  // If nothing has been returned, user has not been found.
  return { error: 'Email Not Found.' };
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
  * @returns {Object} {authUserId: integer} - if registration is successfull
  * @returns {Object} {error: 'Invalid Email Address.'} - if email is invalid (fails validator.isEmail)
  * @returns {Object} {error: 'Email Already in Use.'} - if email is already in data
  * @returns {Object} {error: 'Password too Short.'} - if password is <6 characters
  * @returns {Object} {error: Invalid First Name.'} - if first name is too short/long
  * @returns {Object} {error: Invalid Last Name.'} - if last name is too short/long
*/

function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string): AuthUserId | Error {
  const data = getData();

  if (validator.isEmail(email) === false) return { error: 'Invalid Email Address.' };
  if (data.users.some(user => user.email === email)) return { error: 'Email Already in Use.' };

  if (password.length < 6) return { error: 'Password too Short.' };

  if (nameFirst.length < 1 || nameFirst.length > 50) return { error: 'Invalid First Name.' };
  if (nameLast.length < 1 || nameLast.length > 50) return { error: 'Invalid Last Name.' };

  if (/[^a-zA-Z]/.test(nameFirst)) return { error: 'Invalid First Name.' };
  if (/[^a-zA-Z]/.test(nameLast)) return { error: 'Invalid Last Name.' };

  let newUId = 0;
  while (data.users.some(user => user.uId === newUId)) newUId++;

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

  data.users.push({
    uId: newUId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleString,
    passwordHash: password,
  });

  setData(data);
  return generateSession(newUId);
}

/**
  * Given a session token for a user, closes that token thus logging out the user.
  *
  * @param {string} token - the token representing the session.
  *
  * @returns {error: 'Invalid token'} - if token does not exist in dataStore.
*/
function authLogoutV1(token: string): Record<string, never> {
  const data = getData();
  if (!(data.sessions.some(session => session.token === token))) return { error: 'Invalid token' };

  const sessionIndex = data.sessions.findIndex(session => session.token === token);
  data.sessions.splice(sessionIndex, 1);

  setData(data);
  return {};
}

// Returns true if a character in a string is a number
function isNumber(char: string): boolean {
  return /^\d$/.test(char);
}

export { authLoginV2, authRegisterV2, authLogoutV1 };
