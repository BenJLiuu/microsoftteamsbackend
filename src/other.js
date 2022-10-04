import { getData, setData } from './dataStore.js'

// Clears all the data in the dataStore, for creating fresh datasets in testing. 
function clearV1 () {
  setData({
    users: [],
    channels: [],
  });
  return {};
}

export { clearV1 }