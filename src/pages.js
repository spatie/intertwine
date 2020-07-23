// There needs to be a global "bag" of pages to deal with URL generation of
// aliases. Not a good solution, because pages need to be cleared before
// a rebuild. To refactor, I am not sure how to keep the context yet.

const pages = [];

module.exports.pages = pages;
