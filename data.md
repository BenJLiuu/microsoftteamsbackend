```javascript
let data = {
  nextMessage: 1,
  users: [ 
    {
      uId: 1,
      nameFirst: 'Mitchell',
      nameLast: 'Gayfer',
      email: 'mitchellemail@gmail.com',
      handleStr: 'mitchellgayfer',
      passwordHash: 0x5AF3d6,
      dataStats: {
        channelsJoined: [
          {
            numChannelsJoined: 0,
            timeStamp: 1668419418
          },
          {
            numChannelsJoined: 1,
            timeStamp: 1668419592
          }
        ],
        //et cetera
        dmsJoined: [{numDmsJoined, timeStamp}],
        messagesSent: [{numMessagesSent, timeStamp}], 

        involvementRate: 0.651
      }
    }
  ],

  channels: [
    {
      channelId: 20,
      name: 'myChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: 1,
          nameFirst: 'Mitchell',
          nameLast: 'Gayfer',
          email: 'mitchellemail@gmail.com',
          handleStr: 'mitchellgayfer',
        }
      ],
      allMembers: [
        {
          uId: 1,
          nameFirst: 'Mitchell',
          nameLast: 'Gayfer',
          email: 'mitchellemail@gmail.com',
          handleStr: 'mitchellgayfer',
        },{
          uId: 2,
          nameFirst: 'Jayden',
          nameLast: 'Hunter',
          email: 'jaydenhunter@gmail.com',
          handleStr: 'jaydenhunter',
        }
      ],
      messages: [
        {
          messageId: 300,
          uId: 1,
          message: 'hello world!',
          timeSent: 100000000
        }
      ],
    }
  ],

  dms: [
    {
      dmId: 1,
      name: 'jaydenhunter, mitchellgayfer',
      members: [
        {
          uId: 1,
          nameFirst: 'Mitchell',
          nameLast: 'Gayfer',
          email: 'mitchellemail@gmail.com',
          handleStr: 'mitchellgayfer',
        },{
          uId: 2,
          nameFirst: 'Jayden',
          nameLast: 'Hunter',
          email: 'jaydenhunter@gmail.com',
          handleStr: 'jaydenhunter',
        },
      ]
      owner: {
        uId: 1,
        nameFirst: 'Mitchell',
        nameLast: 'Gayfer',
        email: 'mitchellemail@gmail.com',
        handleStr: 'mitchellgayfer',
      }
      messages: [
        {
          messageId: 301,
          uId: 1,
          message: 'hello jayden!',
          timeSent: 100000000
        }
      ]
    }
  ],

  sessions: [
    {
      token: 'c$jDgeUCeV%kY$fo9%xxwlkvyzFSZ(M^',
      authUserId: 1
    },
  ],
};
```

nextMessage contains the next unused message id. You can get this information using
the helper function generateMessageId. This messageId should be used for channels and DMs, as there should be no conflict.

The example object in the 'users' array contains a uId, first and last names, email and a handle string. Moreover, a field named 'passwordHash' has been included for the hashed version of the password checked on user login. 

The example object in the 'channels' array contains a channel Id and a name for the channel. We have also added an isPublic field containing a boolean showing whether or not the channel is public. Moreover, arrays containing the members with owner privileges and all members have also been added.

The example object in the 'messages' array contains the message's Id, the Id of the user that sent it, a string that contains the contents of the messages and its sent time. Furthermore, the Id of the channel the message has been sent to has also been included.
