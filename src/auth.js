import { getData } from './dataStore.js'


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
  
// Authorises registration given registration details
// Return User ID on success
function authRegisterV1(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  }
}
