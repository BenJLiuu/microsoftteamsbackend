import {getData} from './dataStore.js';

export function validUserId(authUserId) {
    const data = getData();
    return data.users.some(user => user.authUserId === authUserId);
}
