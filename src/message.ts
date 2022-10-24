import { getData, setData } from './dataStore';
import { validUserId, validToken, getUserIdFromToken, validDmId} from './helper';
import { Error  } from './objects';

export function messageSendDmV1(token: string, dmId: number, message: string):  Error {
  if (!validDmId(dmId)) return { error: 'Invalid Dm Id.' };
  const uId = getUserIdFromToken(token);
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };

  if (!validToken(token)) return { error: 'Invalid Token.' };
  if (message.length < 1 || message.length > 1000) return { error: "excess characters"} 
  const data = getData();
  const index = data.dms.findIndex(dm => dm.dmId === dmId);

    return { error: "invalid" }
}

export function messageSendV1(token: string, channelId: number, message: string):  Error {
  
  const uId = getUserIdFromToken(token);
  if (!validUserId(uId)) return { error: 'Invalid User Id.' };

  if (!validToken(token)) return { error: 'Invalid Token.' };
  if (message.length < 1 || message.length > 1000) return { error: "excess characters"} 
  const data = getData();


    return { error: "invalid" }
}