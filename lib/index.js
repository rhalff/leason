'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeOf = require('type-of');

var _typeOf2 = _interopRequireDefault(_typeOf);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _determine = require('./determine');

var _determine2 = _interopRequireDefault(_determine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * Leason
 *
 * @param {Object} options
 */

var Leason = function () {
  function Leason() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Leason);

    this.schema = new _schema2.default();

    // dotmap could give easy access to the keys.
    // so change this to it's own class
    this.dotMap = {};

    this.options = {
      addTitle: options.addTitle || false,
      addDefault: options.addDefault || false,
      captureEnum: options.captureEnum || false,
      setTitle: function setTitle(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    };

    if (options && typeof options.setTitle === 'function') {
      this.options.setTitle = options.setTitle;
    }

    this.setSchemaVersion('draft-04');
  }

  /**
   *
   * Set option
   *
   * @param {String} name
   * @param {Any} value
   */


  _createClass(Leason, [{
    key: 'setOption',
    value: function setOption(name, value) {
      if (this.options.hasOwnProperty(name)) {
        this.options[name] = value;
      }
    }

    /**
     *
     * Set options
     *
     * @param {Object} options key/value pair of options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          this.setOption(opt, options[opt]);
        }
      }
    }

    /**
     *
     * Set schema version
     *
     * Currently only supports v4
     *
     * @param {String} version Schema version string
     */

  }, {
    key: 'setSchemaVersion',
    value: function setSchemaVersion(version) {
      this.schema.$schema = 'http://json-schema.org/' + version + '/schema#';
    }

    /**
     *
     * Iterates the properties of an object and
     * defines them as types.
     *
     * @param {Object} obj current object location
     * @param {Object} properties a properties section within a schema
     */

  }, {
    key: 'scanObject',
    value: function scanObject(obj, properties, position) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          properties[key] = {};
          this.parse(obj[key], properties[key], key, position.slice());
        }
      }
    }

    /**
     *
     * Iterates the items of an array.
     *
     * @param {Object} obj current object location
     * @param {Object} schema the current schema section
     */

  }, {
    key: 'scanArray',
    value: function scanArray(obj, schema, position) {
      for (var i = 0; i < obj.length; i++) {
        // Initial format will be [{},{}]
        // use postProcess to determine the best format.
        // which can be anyOf or just an [] with valid types.
        schema.items[i] = {};
        // should be able to detect duplicates.
        // or just also do that in the postprocess.
        // first just colllect everything, then merge them back.
        this.parse(obj[i], schema.items[i], i, position.slice());
      }

      // here we determine the correct format
      // which for now is just only removing duplicates.
      this.postProcessArray(schema);
    }

    /**
     *
     * Reduces the set of items into unique definitions.
     *
     * @param {Array} items
     */

  }, {
    key: 'postProcessArray',
    value: function postProcessArray(schema) {
      // capture enum is relevant in two cases.
      // when several documents are added & when items of an
      // array are of the primitive type
      // untrue..
      var i = undefined;
      var known = [];
      var remove = [];
      for (i = 0; i < schema.items.length; i++) {
        // Stringify trick, will fail if key order is different.
        var res = JSON.stringify(schema.items[i]);
        if (known.indexOf(res) === -1) {
          known.push(res);
        } else {
          remove.push(res);
        }
      }

      for (i = 0; i < remove.length; i++) {
        schema.items.splice(remove[i], 1);
      }

      // if there is only one type, specify with object
      if (schema.items.length === 1) {
        schema.items = schema.items[0];
      }
    }

    /**
     *
     * Load a schema
     *
     * @param {Object} schema Current schema object
     */

  }, {
    key: 'load',
    value: function load(schema) {
      this.schema = new _schema2.default(schema);
    }
  }, {
    key: '_setDefault',
    value: function _setDefault(schema, val) {
      if (this.options.addDefault) {
        schema['default'] = val;
      }
    }

    /**
     *
     * Parse
     *
     * @param {Object} obj the current (part of the) object to examine
     * @param {Object} schemaPart Current schema part
     * @param {String} key Optional key used during iteration
     * @param {String} position Current position in array format
     */

  }, {
    key: 'parse',
    value: function parse(obj, schemaPart, key) {
      var position = arguments.length <= 3 || arguments[3] === undefined ? [] : arguments[3];

      var schema = schemaPart || this.schema;

      // keep track of our position.
      // maybe this is too late and it should be done within
      // the scan methods. let's first build the hash table.
      if (key !== undefined) {
        position.push(key);
      }

      var dotkey = position.join('.');

      // treat array items equal, eg. [0] [1] all treated as [x]
      dotkey = dotkey.replace(/\.\d+/g, '.x');

      if (!this.dotMap.hasOwnProperty(dotkey)) {
        this.dotMap[dotkey] = new _determine2.default();
      }

      schema.type = (0, _typeOf2.default)(obj);
      if (schema.type === 'object') {
        if (Object.keys(obj).length) {
          schema.properties = {};
          this.scanObject(obj, schema.properties, position);
        }
      } else if (schema.type === 'array') {
        if (obj.length) {
          schema.items = []; // init as object, can become [] ?
          this.scanArray(obj, schema, position);
        }
      } else {
        // console.log(position, this.dotMap)
        this.dotMap[dotkey].values.push(obj);

        if (key && this.options.addTitle) {
          schema.title = this.options.setTitle(key);
        }

        // this._setDefault(schema, obj)
        // Note this is constantly being revaluated
        if (this.options.addDefault) {
          schema['default'] = this.dotMap[dotkey].determineDefault();
        }

        var type = this.dotMap[dotkey].determineType();
        schema['type'] = type;
      }
    }
  }]);

  return Leason;
}();

module.exports = Leason;