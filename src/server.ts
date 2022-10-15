import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';

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
  res.json(authLoginV1(email, password));
});

app.post('/auth/register/v2', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV1(email, password, nameFirst, nameLast));
});

app.post('/channels/create/v2', (req: Request, res: Response) => {
  const { authUserId, name, isPublic } = req.body;
  res.json(channelsCreateV1(authUserId, name, isPublic));
});

app.get('/channels/list/v2', (req: Request, res: Response) => {
  const authUserId = req.query.authUserId as string;
  res.json(channelsListV1(authUserId));
});

app.get('/channels/listAll/v2', (req: Request, res: Response) => {
  const authUserId = req.query.authUserId as string;
  res.json(channelsListAllV1(authUserId));
});

app.put('/channel/invite/v2', (req: Request, res: Response) => {
  const { authUserId, channelId, uId } = req.body;
  res.json(channelInviteV1(authUserId, channelId, uId));
});

app.get('/channel/details/v2', (req: Request, res: Response) => {
  const authUserId = req.query.authUserId;
  const channelId = req.query.authUserId;
  res.json(channelDetailsV1(authUserId, channelId));
});

app.put('/channel/join/v2', (req: Request, res: Response) => {
  const { authUserId, channelId } = req.body;
  res.json(channelJoinV1(authUserId, channelId));
});

app.get('/channel/messages/v2', (req: Request, res: Response) => {
  const channelId = req.query.channelId as string;
  const start = req.query.start as string;
  res.json(channelMessages(channelId, start))
});

app.get('/user/profile/v2', (req: Request, res: Response) => {
  const authUserId = req.query.authUserId as string;
  const uId = req.query.uId as string;
  res.json(userProfileV1(authUserId, uId));
});

app.delete('/clear/v1', (req: Request, res: Response) => {
  res.json(clearV1());
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
