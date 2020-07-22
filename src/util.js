function arrayWrap(item) {
  return Array.isArray(item) ? item : [item];
}

module.exports.arrayWrap = arrayWrap;
