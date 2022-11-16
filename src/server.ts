import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { adminUserPermissionChange, adminUserRemove } from './admin';
import { channelsCreateV3, channelsListV3, channelsListAllV3 } from './channels';
import { authRegisterV3, authLoginV3, authLogoutV2 } from './auth';
import { channelDetailsV3, channelJoinV3, channelInviteV3, channelMessagesV3, channelLeaveV2, channelRemoveOwnerV2, channelAddOwnerV2 } from './channel';
import { echo } from './echo';
import { clearV1 } from './other';
import { usersAllV2, usersStatsV1 } from './users';
import { userProfileSetNameV2, userProfileSetEmailV2, userProfileSetHandleV2, userProfileV3, userStatsV1 } from './user';
import { dmCreateV2, dmListV2, dmLeaveV2, dmMessagesV2, dmDetailsV2, dmRemoveV2 } from './dm';
import {
  notificationsGetV1, messageSendDmV2, messageSendV2,
  messageEditV2, messageRemoveV2, messageShareV1,
  messageReactV1, messageUnreactV1, messagePinV1,
  messageUnpinV1, messageSendlaterV1, messageSendlaterDmV1,
  searchV1
} from './message';
import { standupStartV1, standupActiveV1, standupSendV1 } from './standup';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// ECHO ROUTE

app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// ADMIN ROUTES

app.post('/admin/userpermission/change/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { uId, permissionId } = req.body;
    res.json(adminUserPermissionChange(token, uId, permissionId));
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const uId = req.query.uId as string;
    res.json(adminUserRemove(token, uId ? parseInt(uId) : undefined));
  } catch (err) {
    next(err);
  }
});

// AUTH ROUTES

app.post('/auth/login/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    res.json(authLoginV3(email, password));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', (req: Request, res: Response, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    res.json(authRegisterV3(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(authLogoutV2(token));
  } catch (err) {
    next(err);
  }
});

// CHANNELS ROUTES

app.post('/channels/create/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { name, isPublic } = req.body;
    res.json(channelsCreateV3(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(channelsListV3(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listAll/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(channelsListAllV3(token));
  } catch (err) {
    next(err);
  }
});

// CHANNEL ROUTES

app.post('/channel/invite/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, uId } = req.body;
    res.json(channelInviteV3(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const channelId = req.query.channelId as string;
    res.json(channelDetailsV3(token, channelId ? parseInt(channelId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId } = req.body;
    res.json(channelJoinV3(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const channelId = req.query.channelId as string;
    const start = req.query.start as string;
    res.json(channelMessagesV3(token, channelId ? parseInt(channelId) : undefined, start ? parseInt(start) : undefined));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId } = req.body;
    res.json(channelLeaveV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeOwner/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, uId } = req.body;
    res.json(channelRemoveOwnerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addOwner/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, uId } = req.body;
    res.json(channelAddOwnerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

// USER ROUTES

app.get('/user/profile/v3', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const uId = req.query.uId as string;
    res.json(userProfileV3(token, uId ? parseInt(uId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { nameFirst, nameLast } = req.body;
    res.json(userProfileSetNameV2(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { email } = req.body;
    res.json(userProfileSetEmailV2(token, email));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { handleStr } = req.body;
    res.json(userProfileSetHandleV2(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(usersAllV2(token || undefined));
  } catch (err) {
    next(err);
  }
});

// DM ROUTES

app.post('/dm/create/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { uIds } = req.body;
    res.json(dmCreateV2(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { dmId } = req.body;
    res.json(dmLeaveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const dmId = req.query.dmId as string;
    res.json(dmRemoveV2(token, dmId ? parseInt(dmId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const dmId = req.query.dmId as string;
    res.json(dmDetailsV2(token, dmId ? parseInt(dmId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const dmId = req.query.dmId as string;
    const start = req.query.start as string;
    res.json(dmMessagesV2(token, dmId ? parseInt(dmId) : undefined, start ? parseInt(start) : undefined));
  } catch (err) {
    next(err);
  }
});

// MESSAGE ROUTES

app.post('/message/sendDm/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { dmId, message } = req.body;
    res.json(messageSendDmV2(token, dmId, message));
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, message } = req.body;
    res.json(messageSendV2(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { messageId, message } = req.body;
    res.json(messageEditV2(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const messageId = req.query.messageId as string;
    res.json(messageRemoveV2(token, messageId ? parseInt(messageId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { messageId, reactId } = req.body;
    res.json(messageReactV1(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { ogMessageId, message, channelId, dmId } = req.body;
    res.json(messageShareV1(token, ogMessageId, message, channelId, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { messageId, reactId } = req.body;
    res.json(messageUnreactV1(token, messageId, reactId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { messageId } = req.body;
    res.json(messagePinV1(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { messageId } = req.body;
    res.json(messageUnpinV1(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, message, timeSent } = req.body;
    res.json(messageSendlaterV1(token, channelId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { dmId, message, timeSent } = req.body;
    res.json(messageSendlaterDmV1(token, dmId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const queryStr = req.query.queryStr as string;
    res.json(searchV1(token, queryStr));
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(notificationsGetV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(userStatsV1(token));
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(usersStatsV1(token));
  } catch (err) {
    next(err);
  }
});
// STANDUP ROUTES

app.post('/standup/start/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, length } = req.body;
    res.json(standupStartV1(token, channelId, length));
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const channelId = req.query.channelId as string;
    res.json(standupActiveV1(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const { channelId, message } = req.body;
    res.json(standupSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

// OTHER ROUTES

app.delete('/clear/v1', (req: Request, res: Response, next) => {
  try {
    res.json(clearV1());
  } catch (err) {
    next(err);
  }
});

// handles errors nicely
app.use(errorHandler());

// for logging errors (print to terminal)
app.use(morgan('dev'));

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully.
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
