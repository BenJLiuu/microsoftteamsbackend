import * as itf from './interfaceTypes';

export type HashedToken = number;
export type HashedPassword = number;
export type Permission = number;

export type PrivateUser = {
  uId: itf.UId,
  nameFirst: itf.Name,
  nameLast: itf.Name,
  email: itf.Email,
  handleStr: itf.HandleStr,
  passwordHash: HashedPassword,
  globalPermissions: Permission,
  notifications: itf.Notifications,
  resetCode: string,
  profileImgUrl: string,
  userStats: itf.UserStats,
};

export type PrivateChannel = {
  channelId: itf.ChannelId,
  name: itf.Name,
  isPublic: itf.IsPublic,
  ownerMembers: itf.Users,
  allMembers: itf.Users,
  messages: itf.Messages,
  activeStandup: itf.ActiveStandup,
  standupTimeFinish: itf.TimeFinish,
  standupMessage: itf.Message,
};

export type PrivateDm = {
  dmId: itf.DmId,
  name: itf.Name,
  members: itf.Users,
  owner: itf.User,
  messages: itf.Messages,
};

export type Session = {
  authUserId: itf.UId,
  token: itf.Token | HashedToken,
};

type Analytics = {
  numChannels: number,
  numDms: number,
  numMessages: number,
  numUsers: number,
  history: itf.WorkplaceStats
}

export type Data = {
  nextMessage: number,
  nextUId: number,
  users: PrivateUser[],
  channels: PrivateChannel[],
  dms: PrivateDm[],
  sessions: Session[],
  workspaceStats: Analytics
};

export type MessageList = {
  messages: itf.Messages,
  start: itf.Start,
  end: itf.End,
};

export type ChannelDetails = {
  name: itf.Name,
  isPublic: itf.IsPublic,
  ownerMembers: itf.User[],
  allMembers: itf.User[],
};

export type DmDetails = {
  name: itf.Name,
  members: itf.Users,
};

export type ChannelsObj = {
  channels: itf.Channels,
};

export type UserObj = {
  user: itf.User,
};

export type MessageIdObj = {
  messageId: itf.MessageId,
}

export type DMsObj = {
  dms: itf.Dms,
}

export type NotificationsObj = {
  notifications: itf.Notifications,
};

export type TimeFinishObj = {
  timeFinish: itf.TimeFinish
}

export type ActiveStandupObj = {
  isActive: itf.ActiveStandup,
  timeFinish: itf.TimeFinish
}

export type SharedMessageIdObj = {
  sharedMessageId: itf.SharedMessageId
}

export type messages = {
  messages: itf.Messages,
};
export type UserStatsObj = {
  userStats: itf.UserStats,
};

export type WorkplaceStatsObj = {
  workspaceStats: itf.WorkplaceStats
}
