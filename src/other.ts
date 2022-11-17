import { Empty } from './interfaceTypes';
import { setData } from './dataStore';
import fs from 'fs';
import path from 'path';

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

    // DataStats storage
    workspaceStats: {
      numChannels: 0,
      numDms: 0,
      numMessages: 0,
      numUsers: 0,
      history: {
        channelsExist: [{
          numChannelsExist: 0,
          timeStamp: Date.now()
        }],
        dmsExist: [{
          numDmsExist: 0,
          timeStamp: Date.now()
        }],
        messagesExist: [{
          numMessagesExist: 0,
          timeStamp: Date.now()
        }],
        utilizationRate: 0
      }
    }
  });

  const directory = './static';

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (file !== 'default_profile_photo.jpg') {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
  return {};
}
