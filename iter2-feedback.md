W13A_AERO

# Iteration 2 Feedback  

[TOC]  

| Team Member | Contributions                                                |
| ----------- | ------------------------------------------------------------ |
| Mitchell    | `auth/register`, `auth/logout`, `channel/details`, `channel/messages`, `dm/details`, `dm/remove`, `dm/messages`<br />server + conversion of all iter1 code to HTTP<br />persistence<br />TS (with Jay)<br />frontend testing (with Jay) |
| Jayden      | `auth/login`, `channels/create`, `user/profile`, `users/all`<br />linting<br />issue board management<br />TS (with Mitch)<br />frontend testing (with Mitch) |
| Cedric      | `channel/invite`, `channel/join`, `dm/create`, `dm/list`, `dm/leave`, `message/edit`, `message/remove` |
| Vidit       | `user/*`,`channels/list`, `channels/listall`   |
| Ben         | `channel/leave`, `channel/addowner`, `channel/removeowner`, `message/send`, `message/senddm` |
|**Summary**|Mitchell and Jayden overworked; iter3 workload distribution should be more even|

Commit used for marking:

`62e176a91f5d9e0d8464632e3afa6b0c63429b9d`

## Code Quality (30%)  

### Code Style & Clarity

*   `server.ts`: looking nice and clean
    *   note that it's not entirely necessarily to check if the query parameters are `undefined` (in the tutorial code, our GET route had an optional parameter, so we actually had to check whether it was passed in)
    *   some of your route definitions are duplicated (`user/profile/set*`)
*   `channel.ts`:
    *   double-check the accuracy of all your JSDoc comments - `channelMessages` lists its first parameter as `authUserId`
    *   some of your variable names could be a bit clearer - e.g.`privateIndexAll` in `channelLeave`
    *   make sure all of your variable names follow `camelCase` conventions - e.g. `UserId` in `channelLeave` goes against convention
*   `dm.ts`: 
    *   always choose meaningful and detailed variable names - e.g. in `dmList`, `for (const i of data.dms)` implies that we are iterating over indices; using something like `for (const dm of data.dms)` would be clearer
    *   you can make `dmCreate` even more readable by moving the code to generate ID and name into helper functions
*   `message.ts`: 
    *   your `timeSent` is currently in milliseconds - check whether that conforms to the specification; this [link](https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript) is included in the Input/Output Table for guidance on how to generate UTC timestamps
    *   you could call `messageRemove` if `messageEdit ` is called with an empty message argument

*   general advice that applies to a few of your files: you can move a lot of your 'finder' code and ID generation code into helper functions to reduce repetition and improve readability - some of this is already done in some places, just not in all
*   you have lots of good helpers and are using helper functions in a lot of appropriate places - see, however, if some of your helpers could be simplified (in terms of logic or/and in terms of using smart JS tools)
    *   avoid using C-style `for` loops where methods like `find`, `findIndex` or `some` would do the trick
    *   checks like `if (condition) { return true; } else { return false; }` can be written as a ternary expression

*   there's quite a lot of different types of helper functions inside  `helpers.ts` - you might want to separate the one `helpers.ts` into several files, each dedicated to a certain "kind" of helper

### Test Coverage

*   your test coverage is generally quite good - all success and error cases seem to have been tested

    *   *note*: a few of your tests could be testing the routes' spec descriptions and side effects more thoroughly - I'll talk about that under **Test Design**
*   there are a few other cases you could test, e.g. (there might be more but these are the ones I've spotted so far):
    *   `channel/leave`: channel owner leaving
    *   `dm/leave`: DM owner leaving
    *   `dm/messages`: currently, the only success test is for a DM with no messages - there are a lot more cases you should test here (more than 0 but less than 50 messages, 50, more than 50, different `start` values)
    *   `dm/remove`: when multiple DMs exist in Beans, only the one represented by `dmId` is removed
    *   `message/send` and `message/senddm`: check that `messageId`'s are unique among messages in the same channel; in different channels

### Test Clarity

*   avoid excessive vertical whitespace (blank lines between lines of code) - this issue pops up in `channel.test.ts` (e.g. `channel/join`, `channel/leave`, `channel/addowner`) and in some tests in `dm.test.ts` 

*   `channel/messages`: the comment warning about white-box testing seems to be outdated and should therefore be removed
*   keep an eye out for redundant comments, e.g. `// userProfileSetHandle tests` right above `describe('Test userProfileSetHandle', () => {` (this happens in a few other places too)
*   keep an eye out for typos in test descriptions, e.g. "authuorised" in `channel/addowner`, `channel/removeowner`
*   check that all test descriptions are accurate, especially when updating your tests from one iteration to the next
    *   the `user/profile` invalid token test is described as 'authUserId is invalid'
    *   `channel/leave` has 2 'invalid channelId' tests, the 2nd of which actually tests a non-member user leaving the channel

*   apart from the above, your tests are quite clear and easy to read
    *   having a test file per route and more extensive use of `describe` blocks will help with further improving clarity - I'll talk more about that under **Test Design**

### Test Design

*   with each test file containing tests for a group of routes, it's more difficult to check a) whether all routes have been tested, and b) whether all scenarios for each route have been tested - hence, having a test file per route is preferred
*   quite a lot of test setup is being repeated across your tests - you can reduce this repetition by moving repeated setup (e.g. registering a user) into `beforeEach`
*   use `describe` blocks to separate error cases from valid cases
    *   in some files (e.g. `message.test.ts`, `auth.test.ts`) you use comments for this - `describe`s are a better tool for the job

*   your tests should be fully black-box (and if you do decide to write additional white-box tests just for your own peace of mind, you should keep them in a separate directory and I will not consider them in marking)
    *   avoid testing specific error messages as each group's error messages are different - this issue pops up in `auth.test.ts` and `users.test.ts`
    *   remember also not to hard-code IDs - e.g. the success case for `dm/leave` assumes the first user ID is 0
    *   lastly, avoid hard-coding 'invalid' tokens - lots of `channel/*`,  `message/*`, and `dm/*` tests use 'test' as an invalid token value
*   invalid token tests: tampering with an existing token (e.g. the way you do in `users.test.ts`) is ok, but another way you can make a token invalid is via `auth/logout` 
    *   technically, they are 2 separate cases: a token that's been tampered with VS a valid token invalidated through logging out - might not be a bad idea to test both
*    `repeat` is a elegant way to generate test strings of particular length - it's a better alternative to creating very long strings manually
*   a few of your tests could be testing routes' spec descriptions, side effects, and returns more thoroughly:
    *   `channel/messages`: for more than 50 messages, make multiple `channel/messages` calls to make sure all messages are retrieved correctly, and start and end are set correctly in all returns; also, check the order of messages more thoroughly
    *   `dm/messages`: the success case for DM with no messages should explicitly check that `messages` is an empty array (currently using `expect.any(Array)`)
    *   `dm/details`: the sucess case tests should explicitly check the returned values - `expect.any()` is too vague
    *   `message/send` and `message/senddm`: check not only the `message` attribute but all the others too (expecting `timeSent` to be a specific value may not work but you can check whether it's within a reasonable range.)
    *   to summarise: don't overuse `expect.any()` - generally, you should have thorough checks for anything specified in the interface



### Working with Frontend

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

- [x] open 2 browser windows: 1 public, 1 private/incognito (or, open 1 window each in different browsers, e.g. 1 Chrome window, 1 Firefox)

    *   this is to simulate multiple users using Beans at the same time, or a single user who's logged in on multiple devices (i.e. has multiple active sessions)

Basics

- [x] can't register with malformed email (bat@man) or 3 char password (bat)
- [x] register 1st user (bat man, bat@bat.man, batman) in window 1

Brief detour: sessions

- [x] log in user 1 in window 2
- [x] log out user 1 from original window
- [x] user 1 should remain logged in in window 2 (refresh to check)

Basics (cont.)

- [x] register 2nd user (cat man, meow@cat.man, catman1000000) in window 1
- [x] user 1 creates public channel (bat cave)
- [x] user 2 creates private channel (cat castle)
- [x] user 2 creates DM with user 1
- [x] user 1 invites user 2 into bat cave
- [x] user 1 joins cat castle (global owner can join private channel)
- [x] both users send a few messages to channels and DM (look at order and message details like timestamp, sender)

Extra

- [x] users can't change handle to hellodarknessmyoldfriend (too long)
- [x] users can change handles to batboi and catboi, respectively
- [x] user 1 can't remove DM (global owners have no special perms in DMs)
- [x] user 2 can remove DM (is DM creator)
- [x] user 1 can add user 2 as owner of bat cave
- [x] now user 2 can remove user 1 as owner of bat cave (it's a coup! :scream:)

### Persistence

- [x] kill server and frontend (CTRL-C) :skull:
- [x] restart server and frontend
- [x] log in with bat@bat.man, batman
- [x] expecting 2 users and 2 channels containing old messages (and DM + messages if we didn't get around to removing the DM)
- [ ] if the above fails, examine the code + data files, if any


## Git & Project Management (20%)  

### Commits  

*   mostly good commit messages, with some exceptions, e.g. 
    *   "test changes" / "changed tests a bit"
    *   "Fix global issues"
    *   "Small typo."
*   remember always to give a brief description of what was changed AND where

### Merge Requests  

*   I'd love to see a little more consistency across MR titles - pick a title convention and stick to it
*   try to keep your MR titles descriptive and meaningful to those outside of your team (e.g. me) - you might have a reasonable idea of what 'setX routes' means, but it's not so straightforward to me (and it might not be straightforward to you in 3 months' time :stuck_out_tongue_winking_eye:) 

### Tests Before Implementation

*   generally, tests seem to be written and committed before implementation, however, in some cases, the evidence of test-driven development is lacking or could be more convincing
    *   remember that we want to see clear evidence of tests being written before the implementation: when we write tests first, we write better, unbiased, more comprehensive tests
    *   typically, if implementation code has no tests that cover it, we can/should assume that that code does not work
*   `message/remove`: tests and implementation committed in separate commits but at the same time
*   `message/send` and `message/senddm`: only error tests committed before full implementation, meaning limited confidence in the routes' ability to correctly handle valid behaviour at the time of the implementation commit
*   `channel/leave`, `channel/addowner`, `channel/removeowner`: similar to above, only error tests committed before full implementation; success case tests not committed until several days later

### Task Board  

*   looking beautiful - great use of milestones, boards, labels, and deadlines, and all issues are assigned
*   for feature-related issues, titles only mention implementation - presumably, tests are part of the issue too

### Communications  

*   I'd love to see more consistent activity from ALL team members on Teams

### Standups & Meetings  

*   the evidence of meetings is sufficient, though I would love to see more meetings attended by ALL team members

*   I had trouble finding evidence of regular, structured standups

*   copypasting the Teams "how to standup" notice (26/10 13:02, **Reminder re: standups**) below:

    >   Remember: **ALL** team members must participate in each standup!
    >
    >   Your standups should be **regular** - set a clear, unambigious schedule that works for all. E.g. for synchronous standups, it can be something like a 15 min video call every Mon, Wed, Fri at 9am; for asynchronous standups, "everyone posts an update between 9am and 11am on Mon, Wed, Fri". Having a very clear schedule is particularly important for async standups - those are very easy to forget! I.e. avoid something like "let's all post an update at some point today" and choose a specific time window instead (especially since you don't have time zones to worry about ![😉](https://statics.teams.cdn.office.net/evergreen-assets/personal-expressions/v2/assets/emoticons/wink/default/20_f.png?v=v14?v=4)).
    >
    >   Your standups should also **follow a clear structure**. Answer the following 3 questions (or some variation of them):
    >
    >   1.  What have I done since the last standup?
    >   2.  What do I plan on doing before the next standup?
    >   3.  What's currently blocking me?

### Meeting Minutes

*   the minutes look ok, though they could include extra detail like time/duration of meeting; the minutes for '2022.10.12' also do not include attendance

___

Well done, AERO! Good luck with iter3. :slightly_smiling_face:
