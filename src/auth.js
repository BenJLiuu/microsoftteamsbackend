import { getData } from './dataStore'
// Authorises a login given login details
// Returns the User Id on a success.
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
    error: 'Username Not Found.' 
  }
}
  
// Authorises registration given registration details
// Return User ID on success
function authRegisterV1(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1,
  }
}
