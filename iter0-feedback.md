W13A_AERO

# Iteration 0 Manual Marking  

[TOC]  

## Marking Setup

If you wonder about the intricacies of my manual marking process, wonder no more. :wink:

Warning: it is a little convoluted but it's how I like it. :laughing: Feel free to skip ahead!

```bash
git clone gitlab@gitlab.cse.unsw.EDU.AU:COMP1531/22T3/groups/W13A_AERO/project-backend.git AERO # clone your repo into AERO directory
cd AERO
git checkout f0b30ba2879356f00310a6bb3669a746b37bd2c1 # switch to your iter0 submission commit (I could also `checkout` to the `submission` tag but that tag'll be overwritten by your next submission)
git checkout -b val/iter0-feedback # create new branch based off your submission commit
code iter0-feedback.md # open a new file in VS Code
# look at your code, GitLab repo, Teams, etc.
# write feedback
git status # sanity-check that I'm in the right place and on the right branch - if I add/commit/push changes to the wrong place, I can fix things but it can be a pain and I don't like pain
git add iter0-feedback.md
git commit -m "Add iteration 0 feedback"
git push --set-upstream origin val/iter0-feedback
# check that all looks good on GitLab and discover 50 typos because that is how it be
```

## Documentation (20%)  

### Data Structure  

* You've clearly considered the needs of the iter0 iterface in your data structure design. Your structure allows for multiple users, channels, and messages, and contains the necessary fields to support a Teams-like application. You've even hashed the password, which is not required in iter1 (but may or may not be required later). Well done!

* The way you currently store messages (as their own property inside the `data` object, with the message object containing a `channelId` to link the message with the channel in which it's posted) is totally valid but does have implications for functions like `channelMessagesV1` (which returns chunks of messages from a particular channel). You can store messages inside the channel object instead, to make it very straightforward to access a channel's messages - but you certainly don't have to! Refer to the first dot point under "General Iteration 1 tips" below for more info.

* It's not a problem that you've used `let` for your `data` - that is what we gave you in the iter0 starter code, and that is what we give you in `dataStore.js` for iter1 (because the `setData()` function assigns a new value to the `data` variable). However, remember that you generally want to start with `const` and change it to `let` once it's obvious that you'll need to reassign the variable - using `const` by default can reduce bugs and make your code easier to reason about.
  
General Iteration 1 tips:
* As long as your iter1 interface functions strictly follow the given description/parameters/returns, there are many different valid approaches to storing your data. You can go with what you currently have or do something else - discuss this as a team. Don't overthink it in terms of optimality or efficiency (this is not a data structures course) but you should certainly consider how easy it will be to retrieve, add, and remove data. Once you start implementing your functions, it will become clear if your data structure is easy to work with or if it needs to be modified in minor or major ways.
* Some operations on your data structure will be performed frequently by almost everyone. Make sure to reduce code repetition by writing helper functions for these tasks (best to put these helpers in a dedicated file).
* You should be returning exactly what the interface asks for - **no more, no less**. Often you will need to do some processing or modifications to your retrieved data before you return it from your functions, because e.g. 
  * your data structure will contain some data that shouldn't be returned (e.g. user passwords!), and
  * storing data differently to how it needs to be returned can make for better code design (e.g. consider the "single source of truth" code design principle).

## Git Practices (30%)  

### Commits  

* Your commit messages are great! Well done.

* Remember to *always* specify not only **what** you did but also **where** you did it. In specifying the **what** and the **where**, use information that is most helpful to the reader.
    * Hypothetical example: "make some minor changes to variables on lines 20-30" is a detailed message but not a very informative one. Instead, you could say "Change snake_case variables to camelCase in channelDetailsV1".
* When writing your commit messages, consider whether future you who's looking at your commit history (e.g. through `git log`) in 3 months' time will have any idea about the changes being committed. If your messages don't pass the "future you" test, they won't pass the "Val marking" test!

* Make sure that your messages are not repeated across multiple commits - we want to be able to easily figure out what's actually being changed, without having to go through the trouble of clicking on the commit to see the changes. (You haven't really been guilty of this, but remember this for the future.)

### Merge Requests  

* There were some minor issues with your merge requests early on that we discussed in our Week 2 lab, but your more recent MRs are looking really solid! 
  
* Remember that the process we want you to follow is:
  1. Person A opens merge request (MR).
  2. One or more people (other than person A) review the MR, and either identify issues that need fixing or approve the MR.
  3. Once the MR is approved by at least 1 other team member, Person A (i.e. the person who opened the MR) merges the MR.

* Nearly all your MRs were approved by someone other than the person who opened the MR, which is fantastic.
* On some occasions, the approver merged the MR. Instead, we want the creator of the MR to merge it in because:
  * (presumably) the creator is most familiar with the changes and knows best when they're ready to be merged in, and
  * the merge commit will be attributed to them.

* Note that the "will I remember what this is if I look at this in 3 months' time?" principle also applies to your MR titles. Also, remember to always chuck in a brief description of what you've changed and why, especially if the MR contains non-trivial changes (which you have been doing already because you are awesome).

* Earlier branch names did not always contain the name of whoever was working on the task, and the branch-naming format varied a lot across the team. Your recent branches look great though!
* Although "in the real world" it's normal practice to delete merged branches, it does help with marking if you do not delete them, at least until you get your iteration grades back.

## Project Management & Teamwork (10%)  

### Communications  

* Plenty of evidence of communication on MS Teams. 
* A general reminder that every team member is expected to 
  * communicate openly and frequently (or frequently-ish, e.g. at least every couple of days) with their team, and 
  * maintain some sort of presence on MS Teams throughout the whole project. It might be a good idea to, just for the duration of the course, install Teams on the devices you use frequently and have your notifications enabled.

### Meetings  

* Detailed meeting minutes uploaded to the GitLab Wiki.
* A general reminder that it's important for **all team members** to be present during major team meetings (e.g. those at the start of each iteration). That way, everyone stays on the same page and has an opportunity to discuss their progress, raise issues, get help, etc. - this is easier to do in a real-time meeting than over text.
  * Sometimes other commitments get in the way and you can't make a meeting - that's totally understandable. Make sure to let your team know if you can't attend. If someone is consistently unavailable during an agreed-upon timeslot, consider finding an alternative timeslot that works for everyone.

* For the duration of the project, we'll expect you to have at least 1 substantial-ish team meeting (documented via meeting minutes) per week. From iteration 1 onwards, we'll also expect you to have regular standups - check out lecture 2.4 *Working as a team* for more detail.

---  

Well done, and best of luck for iter1! Please let me know if you have any questions/comments/concerns about anything in this doc! Also don't hesitate to reach out for help with iter1. :slightly_smiling_face:

Cheers,
Val
