import { Data } from './objects';
import fs from 'fs';

let data = {
  users: [],
  channels: [],
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

/*// Use get() to access the data
function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: Data) {
  data = newData;
}*/

export function setData(newData: Data) {
  const jsonstr = JSON.stringify(newData);
  fs.writeFileSync('./database.json', jsonstr);
  data = newData;
}

export function getData(): Data {
  const dbstr = fs.readFileSync('./database.json');
  data = JSON.parse(String(dbstr));
  return data;
}

export { getData, setData };
