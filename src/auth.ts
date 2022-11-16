import { getData, setData } from './dataStore';
import { Empty, Email, Password, Name, Token, ResetCode } from './interfaceTypes';
import { Session } from './internalTypes';
import HTTPError from 'http-errors';
import validator from 'validator';
import {
  generateUId, generateSession, generateHandleStr,
  hashCode, validToken, getUserFromEmail,
  validResetCode, validPassword, userStatsConstructor
} from './helper';
import { port } from './config.json';

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
  const intendedUser = data.users.find(u => u.email === email);
  // If nothing has been returned, user has not been found.
  if (!intendedUser) throw HTTPError(400, 'Email Not Found.');

  if (validPassword(intendedUser.passwordHash, password)) return generateSession(intendedUser.uId);
  else throw HTTPError(400, 'Incorrect Password.');
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
    passwordHash: hashCode(password + 'secret'),
    // 1 if first UId made, 2 otherwise.
    globalPermissions: newUId === 0 ? 1 : 2,
    notifications: [],
    resetCode: '',
    profileImgUrl: 'https://localhost:' + port + '/default_profile_photo.jpg',
    userStats: userStatsConstructor(),
  });

  data.workplaceStats.numUsers++;

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

/**
  * Given an email address, if the email address belongs to a registered user, sends them an email containing a secret password reset code.
  * Logs a user out of all current sessions when they request a password reset.
  *
  * @param {Email} email - email to send the reset code to
  *
  * @returns {Empty} {} - in all cases.
*/
export function authPasswordResetRequestV1(email: Email): Empty {
  if (!validator.isEmail(email)) return {};
  const data = getData();
  if (!data.users.find((e) => e.email === email)) return {};
  const resetCode = String(Math.floor(100000 + Math.random() * 900000));
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'beansreset@outlook.com',
      pass: 'aero123!'
    }
  });
  const mailOptions = {
    from: 'beansreset@outlook.com',
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
  user.resetCode = resetCode;
  // logs out user from all sessions
  for (let i = data.sessions.length - 1; i >= 0; --i) {
    if (data.sessions[i].authUserId === uId) {
      data.sessions.splice(i, 1);
    }
  }
  setData(data);
  return {};
}

/**
 * Given a reset code for a user, sets that user's new password to the password provided.
 * Once a reset code has been used, it is then invalidated.
 *
 * @param {ResetCode} resetCode - reset code that user received in email
 * @param {Password} newPassword - new password that user wishes to use
 * @returns {Empty} {} - if no error
 * @throws 400 Error - if resetCode is invalid or password is too short
 */
export function authPasswordResetResetV1(resetCode: ResetCode, newPassword: Password): Empty {
  if (newPassword.length < 6) throw HTTPError(400, 'New password is too short');
  if (!validResetCode(resetCode)) throw HTTPError(400, 'Invalid Reset Code.');
  const data = getData();
  const user = data.users.find(user => user.resetCode === resetCode);
  user.passwordHash = hashCode(newPassword + 'secret');
  user.resetCode = '';
  setData(data);
  return {};
}
