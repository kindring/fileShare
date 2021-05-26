module.exports = (promise) => {
    console.log(promise);
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
}