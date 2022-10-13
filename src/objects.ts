// User and Channel objects based on data.md file

export type User = {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  handleStr: string,
  passwordHash: number,
};

export type PrivateUser = Omit<User, 'passwordHash'>;

export type UserOmitPassword = {
  user: PrivateUser,
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
};

export type Channel = {
  channelId: number,
  name: string,
  isPublic: boolean,
  ownerMembers: number[],
  allMembers: number[],
  messages: Message[],
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

export type Data = {
  users: User[],
  channels: Channel[],
};

export type Error = {
  error: string;
}
