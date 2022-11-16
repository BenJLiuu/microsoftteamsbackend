import { getData, setData } from './dataStore'
import { Empty, Token, UId } from './interfaceTypes';
import { Permission } from './internalTypes';

/**
 * Given a user by their uID, sets their permissions to new permissions described by permissionId.
 * @param token - token of user calling function
 * @param uId - uId of user to update
 * @param permissionId - permissionId - permission to grant
 * @returns {Empty} Empty object if no error.
 */
export function adminUserPermissionChange (token: Token, uId: UId, permissionId: Permission): Empty {
    if (!validToken(token)) throw HTTPError(403, 'Invalid Token.');
    if (!validUserId(uId)) throw HTTPError(400, 'Invalid User Id.');
    if (permissionId !== 1 && permissionId !== 2) throw HTTPError(400, 'Invalid Permission Id.');
    const data = getData();
    return {};
}