<<<<<<< assumptions.md
## Assumptions:
 1. The First and Last names of each user are assumed to only have alphabetical characters.
 2. It is assumed that 2^53 - 1 users will not use the application.
 3. It is assumed that 2^53 - 1 channels will not be created.
 4. Created channels are assumed to not contain any special characters.
 5. No first name, last name, email, or channel name will be longer than the maximum string length in Javascript (2^53 - 1).
 6. The user who creates a channel is assumed to be the owner of the channel.
 7. All owners of a channel are assumed to also be be members of that channel.
=======
Assumptions:
1. Within dataStore, there are 2 pre-existing fields 'users' and 'channels' that
   are cleared with each use, but not deleted.
2. Within the 'users' field, the users' id is stored in a uId key.
3. If a user, upon registration, puts in a first and/or last name with characters
   that are not in the alphabet, the registration fails.
>>>>>>> assumptions.md