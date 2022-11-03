W13A_AERO

# Iteration 2 Feedback  

[TOC]  

## Code Quality (30%)  

### Code Style & Clarity

### Test Coverage

### Test Clarity

### Test Design

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

### Merge Requests  

### Tests Before Implementation

### Task Board  

### Communications  

### Standups & Meetings  

### Meeting Minutes

