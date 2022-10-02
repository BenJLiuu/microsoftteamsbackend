import { getData, setData } from './dataStore.js'

// Clears all the data in the dataStore, for creating fresh datasets in testing. 
function clearV1 () {
  const data = getData();

  // Iterates through data, removing all properties within the object.
  for (const key in data) {
    delete data[key];
  }

  setData(data);
  return;
}

export { clearV1 }