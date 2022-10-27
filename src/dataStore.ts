import { Data } from './objects';
import fs from 'fs';

let data: Data = {
  nextMessage: 1,
  users: [],
  channels: [],
  sessions: [],
  dms: [],
};

function setData(newData: Data) {
  const jsonstr = JSON.stringify(newData);
  fs.writeFileSync('./src/database.json', jsonstr);
  data = newData;
}

function getData(): Data {
  const dbstr = fs.readFileSync('./src/database.json');
  data = JSON.parse(String(dbstr));
  return data;
}

export { getData, setData };
