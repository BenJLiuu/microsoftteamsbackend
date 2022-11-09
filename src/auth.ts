import { getData, setData } from './dataStore';
import { Empty, Email, Password, Name, Token } from './interfaceTypes';
import { Session } from './internalTypes';
import HTTPError from 'http-errors';
import validator from 'validator';
import { generateUId, generateSession, generateHandleStr, hashCode, validToken, getUserFromEmail } from './helper';

/**
  * Logs in a user and returns their user Id.
  *
  * @param {Email} email - the users' email
  * @param {Password} password - the users' password, unencrypted
  * ...
  *
  * @returns {Session} {authUserId, token} - If login is successful
  * @returns {Error} {error : 'Incorrect Password.'} - If email is found, but password is incorrect
  * @returns {Error} {error : 'Email Not Found.'} - If email was not found.
*/
export function authLoginV3(email: Email, password: Password): Session {
  const data = getData();
  for (const user of data.users) {
    if (user.email === email) {
      // Found an email match
      if (user.passwordHash === password) return generateSession(user.uId);
      else throw HTTPError(400, 'Incorrect Password.');
    }
  }

  // If nothing has been returned, user has not been found.
  throw HTTPError(400, 'Email Not Found.');
}

/**
  * Registers a user and returns their new user Id.
  * Also generates a unique user handle.
  *
  * @param {Email} email - the user's email address
  * @param {Password} password - the user's password
  * @param {Name} nameFirst - the user's first name
  * @param {Name} nameLast - the user's last name
  *
  * @returns {Session} {authUserId, token} - if registration is successfull
  * @returns {Error} {error: 'Invalid Email Address.'} - if email is invalid (fails validator.isEmail)
  * @returns {Error} {error: 'Email Already in Use.'} - if email is already in data
  * @returns {Error} {error: 'Password too Short.'} - if password is <6 characters
  * @returns {Error} {error: Invalid First Name.'} - if first name is too short/long
  * @returns {Error} {error: Invalid Last Name.'} - if last name is too short/long
*/
export function authRegisterV3(email: Email, password: Password, nameFirst: Name, nameLast: Name): Session {
  let data = getData();

  if (!validator.isEmail(email)) throw HTTPError(400, 'Invalid Email Address.');
  if (data.users.some(user => user.email === email)) throw HTTPError(400, 'Invalid Email Address.');

  if (password.length < 6) throw HTTPError(400, 'Password too Short.');

  if (nameFirst.length < 1 || nameFirst.length > 50) throw HTTPError(400, 'Invalid First Name.');
  if (nameLast.length < 1 || nameLast.length > 50) throw HTTPError(400, 'Invalid Last Name.');

  if (/[^a-zA-Z0-9]/.test(nameFirst)) throw HTTPError(400, 'Invalid First Name.');
  if (/[^a-zA-Z0-9]/.test(nameLast)) throw HTTPError(400, 'Invalid Last Name.');

  const newUId = generateUId().uId;
  const handleStr = generateHandleStr(nameFirst, nameLast);

  data = getData();
  data.users.push({
    uId: newUId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handleStr,
    passwordHash: password,
    // 1 if first UId made, 2 otherwise.
    globalPermissions: newUId === 0 ? 1 : 2,
  });

  setData(data);
  return generateSession(newUId);
}

/**
  * Given a session token for a user, closes that token thus logging out the user.
  *
  * @param {Token} token - the token representing the session.
  *
  * @returns {Error} {error: 'Invalid token'} - if token does not exist in dataStore.
*/
export function authLogoutV2(token: Token): Empty {
  if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
  const data = getData();

  const hashedToken = hashCode(token + 'secret');
  const sessionIndex = data.sessions.findIndex(s => s.token === hashedToken);
  data.sessions.splice(sessionIndex, 1);

  setData(data);
  return {};
}

export function authPasswordResetRequestV1(email: Email): Empty {
  if (!validator.isEmail(email)) return {};
  const data = getData();
  if (!data.users.find((e) => e.email === email)) return {};
  const resetCode = String(Math.floor(100000 + Math.random() * 900000));
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'aero.passwordreset@outlook.com',
      pass: 'aero123!'
    }
  });
  const mailOptions = {
    from: 'aero.passwordreset@outlook.com',
    to: email,
    subject: 'Reset your password!',
    text: resetCode,
  };
  transporter.sendMail(mailOptions, function(error: any, info: any) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  const user = getUserFromEmail(email);
  const uId = user.uId;
  // logs out user from all sessions
  for (let i = data.sessions.length - 1; i >= 0; --i) {
    if (data.sessions[i].authUserId === uId) {
      data.sessions.splice(i, 1);
    }
  }
  setData(data);
  return {};
}
