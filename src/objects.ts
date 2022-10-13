// User and Channel objects based on data.md file

export type User = {
    uId: number,
    nameFirst: string,
    nameLast: string,
    email: string,
    handleStr: string,
    passwordHash: number,
};

export type UserOmitPassword = Omit<User, 'passwordHash'>;

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
