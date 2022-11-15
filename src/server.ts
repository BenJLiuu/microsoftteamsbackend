fetch(imgUrl).then((response) => {
  if (response.status !== 200) {
    throw new Error;
  }
  })
.catch(err => {
  throw HTTPError(400, 'Error Encountered.');
});