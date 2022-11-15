import { Data } from './internalTypes';
import fs from 'fs';

let data: Data = {
  nextMessage: 1,
  nextUId: 0,
  users: [],
  channels: [],
  sessions: [],
  dms: [],
  
  // DataStats storage
  workspaceStats: {
    numChannels: 0,
    numDms: 0,
    numMessages: 0,
    numUsers: 0,
    history: {
      channelsExist: [{
        numChannelsExist: 0,
        timeStamp: Time.now()
      }], 
      dmsExist: [{
        numDmsExist: 0,
        timeStamp: Time.now()
      }],
      messagesExist: [{
        nummessagesExist: 0,
        timeStamp: Time.now()
      }],
      utilizationRate: 0
    }
  }
};

export function setData(newData: Data) {
  const jsonstr = JSON.stringify(newData);
  fs.writeFileSync('./src/database.json', jsonstr);
  data = newData;
}

export function getData(): Data {
  const dbstr = fs.readFileSync('./src/database.json');
  data = JSON.parse(String(dbstr));
  return data;
}
