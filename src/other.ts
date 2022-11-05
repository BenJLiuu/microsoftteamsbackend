import { Empty } from './interfaceTypes';
import { setData } from './dataStore';

/**
  * Clears all the data in the dataStore, for creating fresh datasets in testing.
  *
  * @returns {Empty} {} - function successfully resets all data directly at the data store.
*/
export function clearV1 (): Empty {
  setData({
    nextMessage: 1,
    nextUId: 0,
    users: [],
    channels: [],
    sessions: [],
    dms: [],
  });
  return {};
}
