import { getData, setData } from './dataStore';
import { validUserId, validChannelId, checkUserIdtoChannel, removePassword, validToken, getUserIdFromToken } from './helper';

export function sendDmV1(token: string, dmId: number, message: string): MessageList | Error {

}