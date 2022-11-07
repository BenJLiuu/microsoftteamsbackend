import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import HTTPError from 'http-errors';
import errorHandler from 'middleware-http-errors';

import { channelsCreateV2, channelsListV2, channelsListAllV2 } from './channels';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import { channelDetailsV2, channelJoinV2, channelInviteV2, channelMessagesV2, channelLeaveV1, channelRemoveOwnerV1, channelAddOwnerV1 } from './channel';
import { echo } from './echo';
import { clearV1 } from './other';
import { userProfileV2, usersAllV1, userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1 } from './users';
import { dmCreateV1, dmListV1, dmLeaveV1, dmMessagesV1, dmDetailsV1, dmRemoveV1 } from './dm';
import { messageSendDmV1, messageSendV1, messageEditV1, messageRemoveV1 } from './message';

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

// AUTH ROUTES

app.post('/auth/login/v2', (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    res.json(authLoginV2(email, password));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v2', (req: Request, res: Response, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    res.json(authRegisterV2(email, password, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    res.json(authLogoutV1(token));
  } catch (err) {
    next(err);
  }
});

// CHANNELS ROUTES

app.post('/channels/create/v2', (req: Request, res: Response, next) => {
  const { token, name, isPublic } = req.body;
  //const token = req.header('token');
  res.json(channelsCreateV2(token, name, isPublic));
});

app.get('/channels/list/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  res.json(channelsListV2(token));
});

app.get('/channels/listAll/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  res.json(channelsListAllV2(token));
});

// CHANNEL ROUTES

app.post('/channel/invite/v2', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/details/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV2(token, channelId ? parseInt(channelId) : undefined));
});

app.post('/channel/join/v2', (req: Request, res: Response, next) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV2(token, channelId));
});

app.get('/channel/messages/v2', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  res.json(channelMessagesV2(token, channelId ? parseInt(channelId) : undefined, start ? parseInt(start) : undefined));
});

app.post('/channel/leave/v1', (req: Request, res: Response, next) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/removeOwner/V1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(token, channelId, uId));
});

app.post('/channel/addOwner/V1', (req: Request, res: Response, next) => {
  const { token, channelId, uId } = req.body;
  res.json(channelAddOwnerV1(token, channelId, uId));
});

// USER ROUTES

app.get('/user/profile/v2', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    const uId = req.query.uId as string;
    res.json(userProfileV2(token, uId ? parseInt(uId) : undefined));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { nameFirst, nameLast } = req.body;
    res.json(userProfileSetNameV1(token, nameFirst, nameLast));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { email } = req.body;
    res.json(userProfileSetEmailV1(token, email));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token');
    const { handleStr } = req.body;
    res.json(userProfileSetHandleV1(token, handleStr));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v1', (req: Request, res: Response, next) => {
  try {
    const token = req.header('token') as string;
    res.json(usersAllV1(token || undefined));
  } catch (err) {
    next(err);
  }
});

// DM ROUTES

app.post('/dm/create/v1', (req: Request, res: Response, next) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/list/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  res.json(dmListV1(token));
});

app.post('/dm/leave/v1', (req: Request, res: Response, next) => {
  const { token, dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

app.delete('/dm/remove/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  res.json(dmRemoveV1(token, dmId ? parseInt(dmId) : undefined));
});

app.get('/dm/details/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  res.json(dmDetailsV1(token, dmId ? parseInt(dmId) : undefined));
});

app.get('/dm/messages/v1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const dmId = req.query.dmId as string;
  const start = req.query.start as string;
  res.json(dmMessagesV1(token, dmId ? parseInt(dmId) : undefined, start ? parseInt(start) : undefined));
});

// MESSAGE ROUTES

app.post('/message/sendDm/V1', (req: Request, res: Response, next) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message));
});

app.post('/message/send/V1', (req: Request, res: Response, next) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/V1', (req: Request, res: Response, next) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/V1', (req: Request, res: Response, next) => {
  const token = req.query.token as string;
  const messageId = req.query.messageId as string;
  res.json(messageRemoveV1(token, messageId ? parseInt(messageId) : undefined));
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
