import {getData} from './dataStore.js';

export function validUserId(authUserId) {
    const data = getData();
    return data.users.some(user => user.authUserId === authUserId);
}

export function validChannelId(channelId) {
    const data = getData();
    return data.channels.some(channel => channel.channelId === channelId);
}

export function checkUserIdtoChannel(authUserId, channelId) {
    const data = getData();
    let posititon = 0;
    for (let i = 0; i < data.channels.length; i++) {
        if (data.channels[i].channelId === channelId) {
            position = i;
        }
    }
    return data.chennels[position].allMembers.some(user => user === authUserId);
}