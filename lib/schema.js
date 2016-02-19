"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * Schema
 *
 * Loads a json schema and into a hot object
 *
 * The original state is the schema, or after one json is parsed.
 * Both cases lead to the initial state.
 *
 * Each property is hot. The properties are auto visited.
 * Because a next document will arrive with largly the same structure.
 *
 * Each schema should SchemaProperty should keep a state.
 *  - visited Times visited
 *  - values  Keep track of each and every value
 *
 * The values must be kept in a circular array, which length is configurable
 * e.g. you do not want to keep 50 thousand values in memory.
 *
 */

var Schema = function () {
  function Schema(schema) {
    _classCallCheck(this, Schema);

    if (schema) {
      this.load(schema);
    }
  }

  _createClass(Schema, [{
    key: "load",
    value: function load() /* schema */{}
  }]);

  return Schema;
}();

exports.default = Schema;


module.exports = Schema;