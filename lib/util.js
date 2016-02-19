"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayUnique = arrayUnique;
exports.mode = mode;
function arrayUnique(a) {
  return a.reduce(function (p, c) {
    if (p.indexOf(c) < 0) {
      p.push(c);
    }
    return p;
  }, []);
}

function mode(array) {
  if (array.length === 0) {
    return null;
  }
  var modeMap = {};
  var maxEl = array[0];
  var maxCount = 1;
  for (var i = 0; i < array.length; i++) {
    var el = array[i];
    if (modeMap[el] === null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }

    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}