```javascript
let data = {
  users: [ 
    {
      uId: 1,
      nameFirst: 'Mitchell',
      nameLast: 'Gayfer',
      email: 'mitchellemail@gmail.com',
      handleStr: 'mitchellgayfer',
      passwordHash: 0x5AF3d6
    }
  ],

  channels: [
    {
      channelId: 20,
      name: 'myChannel',
      isPublic: true,
      ownerMembers: [1, 2, 3],
      allMembers: [1, 2, 3, 4, 5, 6, 7]
    }
  ],

  messages: [
    {
      messageId: 300,
      uId: 1,
      channelId: 20,
      message: 'hello world!',
      timeSent: 100000000
    }
  ],
}
```

[Optional] short description: 
The example object in the 'users' array contains a uId, first and last names, email and a handle string. Moreover, a field named 'passwordHash' has been included for the hashed version of the password checked on user login. 

The example object in the 'channels' array contains a channel Id and a name for the channel. We have also added an isPublic field containing a boolean showing whether or not the channel is public. Moreover, arrays containing the members with owner privileges and all members have also been added.

The example object in the 'messages' array contains the message's Id, the Id of the user that sent it, a string that contains the contents of the messages and its sent time. Furthermore, the Id of the channel the message has been sent to has also been included.