'use strict';

var typeOf = require('type-of');
var Schema = require('./schema');

/**
 *
 * Leason
 *
 * @param {Object} options
 */
function Leason(options) {
  if(!(this instanceof Leason)) {
    return new Leason();
  }

  this.schema = new Schema();

  // dotmap could give easy access to the keys.
  // so change this to it's own class
  this.dotMap = {};

  options = options || {};

  this.options = {
    addTitle: options.addTitle || false,
    addDefault: options.addDefault || false,
    captureEnum: options.captureEnum || false,
    setTitle: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  if(options && typeof options.setTitle === 'function') {
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
Leason.prototype.setOption = function(name, value) {
  if(this.options.hasOwnProperty(name)) {
    this.options[name] = value;
  }
};

/**
 *
 * Set options
 *
 * @param {Object} options key/value pair of options
 */
Leason.prototype.setOptions = function(options) {
  var opt;
  for(opt in options) {
    if(options.hasOwnProperty(opt)) {
      this.setOption(opt, options[opt]);
    }
  }
};

/**
 *
 * Set schema version
 *
 * Currently only supports v4
 *
 * @param {String} version Schema version string
 */
Leason.prototype.setSchemaVersion = function(version) {
  this.schema.$schema = 'http://json-schema.org/' + version + '/schema#';
};

/**
 *
 * Iterates the properties of an object and
 * definies them as types.
 *
 * @param {Object} obj current object location
 * @param {Object} properties a properties section within a schema
 */
Leason.prototype.scanObject = function(obj, properties, position) {
  var key;
  for(key in obj) {
    if(obj.hasOwnProperty(key)) {
      properties[key] = {};
      this.parse(obj[key], properties[key], key, position.slice());
    }
  }
};

/**
 *
 * Iterates the items of an array.
 *
 * @param {Object} obj current object location
 * @param {Object} schema the current schema section
 */
Leason.prototype.scanArray = function(obj, schema, position) {
  var i;
  for(i = 0; i < obj.length; i++) {
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
};

/**
 *
 * Reduces the set of items into unique definitions.
 *
 * @param {Array} items
 */
Leason.prototype.postProcessArray = function(schema) {

  var i;

  // capture enum is relevant in two cases.
  // when several documents are added & when items of an
  // array are of the primitive type
  // untrue..

  var known = [];
  var remove = [];
  for(i = 0; i < schema.items.length; i++) {
    // Stringify trick, will fail if key order is different.
    var res = JSON.stringify(schema.items[i]);
    if(known.indexOf(res) === -1) {
      known.push(res);
    } else {
      remove.push(res);
    }
  }

  for(i = 0; i < remove.length; i++) {
    schema.items.splice(remove[i], 1);
  }

  // if there is only one type, specify with object
  if(schema.items.length === 1) {
    schema.items = schema.items[0];
  }

};

/**
 *
 * Read files from stream and learn the structure.
 *
 * @param {Object} pipe
 */
Leason.prototype.learn = function() {

};

/**
 *
 * Load a schema
 *
 * @param {Object} schema Current schema object
 */
Leason.prototype.load = function(schema) {
  this.schema = new Schema(schema);
};

Leason.prototype._setDefault = function(schema, val) {
  if (this.options.addDefault) {
    schema['default'] = val;
  }
};

/**
 *
 * Parse
 *
 * @param {Object} obj the current (part of the) object to examine
 * @param {Object} schema Current schema part
 * @param {String} key Optional key used during iteration
 * @param {String} position Current position in array format
 */
Leason.prototype.parse = function(obj, schema, key, position) {

  schema = schema || this.schema;

  position = position || [];

  // keep track of our position.
  // maybe this is too late and it should be done within
  // the scan methods. let's first build the hash table.
  if(key !== undefined) position.push(key);

  var dotkey = position.join('.');

  if(!this.dotMap.hasOwnProperty(dotkey)) {
    this.dotMap[dotkey] = new Schema();
  }

  schema.type = typeOf(obj);
  if(schema.type === 'object') {
    if(Object.keys(obj).length) {
      schema.properties = {};
      this.scanObject(obj, schema.properties, position);
    }
  } else if(schema.type === 'array') {
    if(obj.length) {
      schema.items = []; // init as object, can become [] ?
      this.scanArray(obj, schema, position);
    }
  } else {
    //console.log(position, this.dotMap);
    if(key && this.options.addTitle) {
      schema.title = this.options.setTitle(key);
    }
    this._setDefault(schema, obj);
  }

};

module.exports = Leason;
