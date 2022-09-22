```javascript
let data = {
  users: [ 
    {
      uId: 1,
      nameFirst: 'Mitchell',
      nameLast: 'Gayfer',
      email: 'mitchellemail@gmail.com',
      handleStr: 'mitchellgayfer',
      passwordHash: 0x5AF3d6,
    }
  ],

  channels: [
    {
      channelId: 1,
      name: 'myChannel',
      isPublic: true,
    }
  ],
}
```

[Optional] short description: 
The example 'Users' object contains a uId, first and last names, email and a handle string. Moreover, a field named 'passwordHash' has been included for the hashed version of the password checked on user login. 

The example 'Channels' object contains a channel Id and a name for the channel. We have also added an isPublic field containing a boolean showing whether or not the channel is public. 