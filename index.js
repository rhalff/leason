var typeOf = require('type-of');

function Leason(options) {
  if(!(this instanceof Leason)) {
    return new Leason();
  }

  this.schema = {};

  this.options = {
    addTitle: false,
    setTitle: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };

  if(options && typeof options.setTitle === 'function') {
    this.options.setTitle = options.setTitle;
  }

  this.setSchemaVersion('draft-04');
}

Leason.prototype.setSchemaVersion = function(version) {
  this.schema['$schema'] = 'http://json-schema.org/' + version + '/schema#';
};

// "test", schema
Leason.prototype.scanObject = function(obj, properties) {
  var key;
  for(key in obj) {
    if(obj.hasOwnProperty(key)) {
      properties[key] = {};
      this.parse(obj[key], properties[key], key);
    }
  }
};

Leason.prototype.scanArray = function(obj, items) {
  var i;
  for(i = 0; i < items.length; i++) {
    this.parse(items[i], items);
  }
};

Leason.prototype.parse = function(obj, schema, key) {

  schema = schema || this.schema;

  schema.type = typeOf(obj);
  if(schema.type === 'object') {
    if(Object.keys(obj).length) {
      schema.properties = {};
      this.scanObject(obj, schema.properties);
    }
  } else if(schema.type === 'array') {
    if(obj.length) {
      schema.items = [];
      this.scanArray(obj, schema);
    }
  } else {
    // nop, but set title?
    // note when root is string, we need no key
    // but normally we need a key..
    if(this.options.addTitle) {
      schema.title = this.options.setTitle(key);
    }
    // this.setType(obj, schema);
  }

};

module.exports = Leason;
