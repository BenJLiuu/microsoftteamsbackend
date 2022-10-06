## Assumptions:
 1. The First and Last names of each user are assumed to only have alphabetical characters.
 2. It is assumed that 2^53 - 1 users will not use the application.
 3. It is assumed that 2^53 - 1 channels will not be created.
 4. Created channels are assumed to not contain any special characters.
 5. No first name, last name, email, or channel name will be longer than the maximum string length in Javascript (2^53 - 1).
 6. The user who creates a channel is assumed to be the owner of the channel.
 7. All owners of a channel are assumed to also be be members of that channel.