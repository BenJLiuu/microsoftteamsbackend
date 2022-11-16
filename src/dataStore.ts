import { Data } from './internalTypes';
import fs from 'fs';

let data: Data = {
  nextMessage: 1,
  nextUId: 0,
  users: [],
  channels: [],
  sessions: [],
  dms: [],
  workplaceStats: {
    numChannels: 0,
    numDms: 0,
    numMessages: 0,
    numUsers: 0
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
