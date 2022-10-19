import { Data } from './objects';
import fs from 'fs';

let data: Data = {
  users: [],
  channels: [],
  sessions: [],
};

function setData(newData: Data) {
  const jsonstr = JSON.stringify(newData);
  fs.writeFileSync('./database.json', jsonstr);
  data = newData;
}

function getData(): Data {
  const dbstr = fs.readFileSync('./database.json');
  data = JSON.parse(String(dbstr));
  return data;
}

export { getData, setData };
