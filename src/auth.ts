import { getData, setData } from './dataStore';
import { Session, Error } from './objects';
import validator from 'validator';
import { generateSession, generateHandleStr } from './helper';

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
function authLoginV2(email: string, password: string): Session | Error {
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

function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string): Session | Error {
  const data = getData();

  if (validator.isEmail(email) === false) return { error: 'Invalid Email Address.' };
  if (data.users.some(user => user.email === email)) return { error: 'Email Already in Use.' };

  if (password.length < 6) return { error: 'Password too Short.' };

  if (nameFirst.length < 1 || nameFirst.length > 50) return { error: 'Invalid First Name.' };
  if (nameLast.length < 1 || nameLast.length > 50) return { error: 'Invalid Last Name.' };

  if (/[^a-zA-Z0-9]/.test(nameFirst)) return { error: 'Invalid First Name.' };
  if (/[^a-zA-Z0-9]/.test(nameLast)) return { error: 'Invalid Last Name.' };

  let newUId = 0;
  while (data.users.some(user => user.uId === newUId)) newUId++;

  const handleStr = generateHandleStr(nameFirst, nameLast);

  data.users.push({
    uId: newUId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleStr,
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
function authLogoutV1(token: string): Record<string, never> | Error {
  const data = getData();
  if (!(data.sessions.some(session => session.token === token))) return { error: 'Invalid token' };

  const sessionIndex = data.sessions.findIndex(session => session.token === token);
  data.sessions.splice(sessionIndex, 1);

  setData(data);
  return {};
}

export { authLoginV2, authRegisterV2, authLogoutV1 };
