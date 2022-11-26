W13A_AERO

# Iteration 3 Feedback  

[TOC]  

## Feature Demonstrations (10%)

### Working with Frontend

**Note**: instructions on working with the frontend can also be found in the frontend repo: https://gitlab.cse.unsw.edu.au/COMP1531/22T3/project-frontend  

Setup

- [x] clone your project-backend repo  (or `git pull` to get latest updates)

    `git clone gitlab@gitlab.cse.unsw.EDU.AU:COMP1531/22T3/groups/[CLASS_GROUP]/project-backend.git`

- [x] clone the course frontend  repo  (or `git pull` to get latest updates)

    `git clone gitlab@gitlab.cse.unsw.EDU.AU:COMP1531/22T3/project-frontend.git`

- [x] inside `project-backend/`, checkout to submission commit

    `git checkout submission`

    or

    `git checkout [COMMIT_HASH]`

- [x] inside `project-backend/` and `project-frontend/`, run `npm install`

- [x] inside `project-backend/`, run `npm start`

- [x] inside `project-frontend/`, run `bash run-easy.sh ITERATION BACKENDPORT` 

- [x] reset state, e.g. send a `http://localhost:BACKENDPORT/clear/v1` Postman/ARC/[insert your API client of choice] request

- [x] open the frontend URL (http://localhost:3000/) in 2 browser windows: 1 public, 1 private/incognito (or, open 1 window each in different browsers, e.g. 1 Chrome window, 1 Firefox)

    *   this is to simulate multiple users using Beans at the same time, or a single user who's logged in on multiple devices (i.e. has multiple active sessions)

Comments:

*   Frontend works splendidly for the basics but not for some of the new iter3 features. The basics have given you full marks here though. Most issues with the frontend can be traced back to the failed course autotests.


### Implementation of user/profile/uploadphoto

Valid inputs (a pic for every mood):

-   bat http://images.newscientist.com/wp-content/uploads/2021/02/09145420/h82g6f_web.jpg, 300, 100, 900, 700
-   cat http://i.kym-cdn.com/entries/icons/original/000/026/638/cat.jpg, 250, 0, 650, 400
-   potato http://stoller.com.au/wp-content/uploads/2019/03/potato_crop.jpg, 50, 0, 500, 450
-   croissant http://www.bakersdelight.com.au/wp-content/uploads/2018/10/9001.jpg, 100, 100, 900, 900
-   this is fine http://static01.nyt.com/images/2016/08/05/us/05onfire1_xp/05onfire1_xp-superJumbo-v2.jpg, 0, 0, 750, 750
-   chunky pigeon http://i0.wp.com/sitn.hms.harvard.edu/wp-content/uploads/2015/12/15621817783_18bc76922e_z.jpg, 50, 0, 550, 500

Expecting the following:

-   [x] default image supplied for all users
-   [x] errors raised correctly (e.g. for invalid dimensions, invalid file extension)
    -   [x] bread.png http://i.pinimg.com/originals/6f/5f/53/6f5f5332cd54ba419022a4882935dbd5.png, 0, 0, 1000, 1000
    -   [x] bat (1200x800) http://images.newscientist.com/wp-content/uploads/2021/02/09145420/h82g6f_web.jpg, 0, 0, 1200, 1200 
    -   [x] bat http://images.newscientist.com/wp-content/uploads/2021/02/09145420/h82g6f_web.jpg 0, 100, 100, 0
-   [x] image stored correctly
-   [x] image cropped correctly
-   [x] image served correctly (i.e. can see image on the frontend)
    *   **NOTE**: I should be able to see the user's profile image (both the default and the newly uploaded) when viewing the user's channels / DMs. The "default avatar" icon next to "Profile" above "My Channels" won't change (it is actually an icon :smile:).

### Implementation of auth/passwordreset

- [ ] no error raised for unregistered email

    *   Getting the following error:

    ```
    TypeError: Cannot read properties of undefined (reading 'uId') at authPasswordResetRequestV1 (src/auth.ts:142:20)
    ```

- [ ] no email sent to unregistered email
    *   Email is sent to unregistered email.

- [x] code sent to registered email
- [x] all tokens invalidated upon password reset request (getting 403s in other browsers/incognito windows)
- [ ] can reset password with the received code

    *   Unfortunately not - the `resetCode` is not correctly set in your data store. 
    *   Looking at your function, your `resetCode` is set in the `user` object but not in the `data` object. The `data` in `authPasswordResetRequest()` and the `data` in the `getUserFromEmail()` helper function are different objects due to how your `getData() ` behaves. One solution to that is just to pass the `data` object into the helper function rather than retrieving the `data` in the helper function.

    *   I've fixed this issue in your code (using the fix above) so that I could test the next few bits but that comes with a mark penalty.

- [x] cannot login with old password
- [x] can login with new password
- [x] different random codes supplied on different reset requests
- [x] codes invalidated after use

### Deployment

- [ ] URL of deployed backend added to `deploy-url.md` in repo root
    *   No, but I've tried http://w13aaero.alwaysdata.net / https://w13aaero.alwaysdata.net based on `SSH_HOST="ssh-w13aaero.alwaysdata.net"` in your `deploy.sh`

- [ ] `deploy-url/users/all/v2` (or any GET route) shows an invalid token error in browser
- [ ] deployed backend reachable via API client (e.g. ARC/Postman)
- [ ] deployed backend works with frontend (see instructions in the frontend repo for how to connect your deployed backend to the locally running course frontend)  
    **Note**: frontend testing with the deployed backend will be extremely basic (e.g. register user, create channel).

Comments:  
* No ticks above due to the `Connection to upstream failed: connection failure` error. I gave you some partial marks for the deployment attempt though, since you clearly have tried!

