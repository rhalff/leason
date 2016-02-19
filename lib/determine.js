'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Determine = function () {
  function Determine() {
    _classCallCheck(this, Determine);

    this.values = [];
  }

  _createClass(Determine, [{
    key: 'determineType',
    value: function determineType() {
      var type = undefined;
      for (var i = 0; i < this.values.length; i++) {
        type = (0, _typeOf2.default)(this.values[i]);
      }
      return type;
    }

    // this has to has a treshold

  }, {
    key: 'determineEnum',
    value: function determineEnum() {
      return (0, _util.arrayUnique)(this.values);
    }
  }, {
    key: 'determineDefault',
    value: function determineDefault() {
      return (0, _util.mode)(this.values);
    }
  }]);

  return Determine;
}();

exports.default = Determine;