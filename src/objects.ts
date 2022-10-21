// User and Channel objects based on data.md file

export type User = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  passwordHash: string,
};

export type Session = {
  authUserId: number,
  token: string
};

export type AuthUserId = {
  authUserId: number,
};

export type PrivateUser = Omit<User, 'passwordHash'>;

export type UserOmitPassword = {
  user: PrivateUser,
};

export type UsersOmitPassword = {
  users: PrivateUser[],
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
};

export type MessageList = {
  messages: Message[],
  start: number,
  end: number,
};

export type Channel = {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: PrivateUser[],
  allMembers: PrivateUser[],
  messages: Message[],
};

export type ChannelDetails = {
  name: string,
  isPublic: boolean,
  ownerMembers: PrivateUser[],
  allMembers: PrivateUser[],
};

export type ChannelList = {
  channelId: number,
  name: string,
};

export type Channels = {
  channels: ChannelList[],
};

export type ChannelId = {
  channelId: number,
};

export type dmId = {
  dmId: number,
};

export type dm = {
  dmId: number,
  name: string,
  members: PrivateUser[]
};

export type simpleDm = Omit<dm, 'members'>;

export type dmList = {
  dms: simpleDm[]
};

export type Data = {
  users: User[],
  channels: Channel[],
  sessions: Session[],
  dms: dm[]
};

export type Error = {
  error: string;
};

export type Token = {
  authUserId: number,
  token: string,
};
