import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

import { echo } from './echo';
import { channelsCreateV2, channelsListV2, channelsListAllV2 } from './channels';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import { channelDetailsV2, channelJoinV2, channelInviteV2, channelMessagesV2, channelLeaveV1, channelRemoveOwnerV1, channelAddOwnerV1 } from './channel';
import { clearV1 } from './other';
import { userProfileV1, usersAllV1, userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1 } from './users';
import { dmCreateV1, dmListV1, dmLeaveV1 } from './dm';
import { messageSendDmV1, messageSendV1 } from './message';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
app.get('/echo', (req: Request, res: Response, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// for logging errors (print to terminal)
app.use(morgan('dev'));

app.post('/auth/login/v2', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV2(email, password));
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV2(email, password, nameFirst, nameLast));
});

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV2(token, name, isPublic));
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(channelsListV2(token));
});

app.get('/channels/listAll/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(channelsListAllV2(token));
});

app.post('/channel/invite/v2', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/details/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  res.json(channelDetailsV2(token, channelId ? parseInt(channelId) : undefined));
});

app.post('/channel/join/v2', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV2(token, channelId));
});

app.get('/channel/messages/v2', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  res.json(channelMessagesV2(token, channelId ? parseInt(channelId) : undefined, start ? parseInt(start) : undefined));
});

app.get('/user/profile/v2', (req: Request, res: Response) => {
  const authUserId = req.query.authUserId as string;
  const uId = req.query.uId as string;
  res.json(userProfileV1(authUserId ? parseInt(authUserId) : undefined, uId ? parseInt(uId) : undefined));
});

app.get('/users/all/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(usersAllV1(token || undefined));
});

app.post('/auth/logout/v1', (req: Request, res: Response) => {
  const { token } = req.body;
  res.json(authLogoutV1(token));
});

app.post('/dm/create/v1', (req: Request, res: Response) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/list/v1', (req: Request, res: Response) => {
  const token = req.query.token as string;
  res.json(dmListV1(token));
});

app.post('/dm/leave/v1', (req: Request, res: Response) => {
  const { token, dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

app.put('/user/profile/setname/v1', (req: Request, res: Response) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userProfileSetNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response) => {
  const { token, email } = req.body;
  res.json(userProfileSetEmailV1(token, email));
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response) => {
  const { token, handleStr } = req.body;
  res.json(userProfileSetHandleV1(token, handleStr));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

app.post('/channel/leave/v1', (req: Request, res: Response) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/removeOwner/V1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveOwnerV1(token, channelId, uId));
});
app.post('/channel/addOwner/V1', (req: Request, res: Response) => {
  const { token, channelId, uId } = req.body;
  res.json(messageSendV1(token, channelId, uId));
});
app.post('/message/sendDm/V1', (req: Request, res: Response) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message))
});
app.post('/message/send/V1', (req: Request, res: Response) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message))
}); 
// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully.
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
