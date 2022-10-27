import { Empty } from './objects';
import { setData } from './dataStore';

/**
  * Clears all the data in the dataStore, for creating fresh datasets in testing.
  *
  * @param {}  - function is called and runs with no needed parameters.
  *
  * @returns {} - function successfully resets all data directly at the data store.
*/
function clearV1 (): Empty {
  setData({
    nextMessage: 1,
    users: [],
    channels: [],
    sessions: [],
    dms: [],
  });
  return {};
}

export { clearV1 };
