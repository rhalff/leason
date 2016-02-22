'use strict'
import typeOf from 'type-of'
import Schema from './schema'
import Classifier from './classifier'
import {omitter} from './util'

/**
 *
 * Leason
 *
 * @param {Object} options
 */
class Leason {
  constructor (options = {}) {
    this.schema = new Schema()

    // dotmap could give easy access to the keys.
    // so change this to it's own class
    this.classifiers = {}

    this.options = {
      addTitle: options.addTitle || false,
      addDefault: options.addDefault || false,
      captureEnum: options.captureEnum || {},
      captureFormat: options.captureFormat || {},
      setTitle: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
      }
    }

    if (options && typeof options.setTitle === 'function') {
      this.options.setTitle = options.setTitle
    }

    this.setSchemaVersion('draft-04')
  }

  /**
   *
   * Set option
   *
   * @param {String} name
   * @param {Any} value
   */
  setOption (name, value) {
    if (this.options.hasOwnProperty(name)) {
      this.options[name] = value
    }
  }

  /**
   *
   * Set options
   *
   * @param {Object} options key/value pair of options
   */
  setOptions (options) {
    for (let opt in options) {
      if (options.hasOwnProperty(opt)) {
        this.setOption(opt, options[opt])
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
  setSchemaVersion (version) {
    this.schema.$schema = 'http://json-schema.org/' + version + '/schema#'
  }

  /**
   *
   * Iterates the properties of an object and
   * defines them as types.
   *
   * @param {Object} obj current object location
   * @param {Object} properties a properties section within a schema
   */
  scanObject (obj, schema, position) {
    if (Object.keys(obj).length) {
      schema.properties = {}
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          schema.properties[key] = {}
          this.parseSchemaPart(obj[key], schema.properties[key], key, position.slice())
        }
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
  scanArray (obj, schema, position) {
    if (obj.length) {
      schema.items = [] // init as object, can become [] ?
      for (let i = 0; i < obj.length; i++) {
        // Initial format will be [{},{}]
        // use postProcess to determine the best format.
        // which can be anyOf or just an [] with valid types.
        schema.items[i] = {}
        // should be able to detect duplicates.
        // or just also do that in the postprocess.
        // first just colllect everything, then merge them back.
        this.parseSchemaPart(obj[i], schema.items[i], i, position.slice())
      }

      // here we determine the correct format
      // which for now is just only removing duplicates.
      this.postProcessArray(schema)
    }
  }

  /**
   *
   * Reduces the set of items into unique definitions.
   *
   * @param {Array} items
   */
  postProcessArray (schema) {
    // capture enum is relevant in two cases.
    // when several documents are added & when items of an
    // array are of the primitive type
    // untrue..
    let i
    const known = []
    const remove = []
    for (i = 0; i < schema.items.length; i++) {
      // Stringify trick, will fail if key order is different.
      var res = JSON.stringify(schema.items[i], omitter)
      if (known.indexOf(res) === -1) {
        known.push(res)
      } else {
        remove.push(res)
      }
    }

    for (i = 0; i < remove.length; i++) {
      schema.items.splice(remove[i], 1)
    }

    // if there is only one type, specify with object
    if (schema.items.length === 1) {
      schema.items = schema.items[0]
    }
  }

  setEnum (schema, key) {
    if ((schema.type === 'string' || schema.type === 'number') &&
      this.options.captureEnum.minCount > 0) {
      const _enum = this.classifiers[key].determineEnum(
        this.options.captureEnum.minCount,
        this.options.captureEnum.maxVariant
      )
      if (_enum) {
        schema.enum = _enum
      }
    }
  }

  setFormat (schema, key) {
    if (schema.type === 'string' && this.options.captureFormat.minCount > 0) {
      const _format = this.classifiers[key].determineFormat(
        this.options.captureFormat.minCount
      )
      if (_format) {
        schema.format = _format
      }
    }
  }

  setPrimitiveType (schema, key) {
    const type = this.classifiers[key].determineType()
    schema['type'] = type
  }

  setTitle (schema, key) {
    if (key && this.options.addTitle) {
      schema.title = this.options.setTitle(key)
    }
  }

  setDefault (schema, key) {
    if (this.options.addDefault) {
      schema['default'] = this.classifiers[key].determineDefault()
    }
  }

  scanPrimitive (path, obj, schema, key) {
    this.classifiers[path].values.push(obj)

    this.setTitle(schema, key)

    // Note this is constantly being revaluated
    this.setDefault(schema, path)
    this.setPrimitiveType(schema, path)
    this.setEnum(schema, path)
    this.setFormat(schema, path)
  }

  /**
   * Translates the position into a dotted path
   *
   * All array items are treated equal, eg. [0] [1] all become [x]
   *
   * @param position
   * @returns {string}
   */
  getAbsolutePath (position) {
    return position.join('.')
      .replace(/\.\d+/g, '.x')
  }

  /**
   *
   * Load a schema
   *
   * @param {Object} schema Current schema object
   */
  load (schema) {
    this.schema = new Schema(schema)
  }

  parse (obj) {
    this.parseSchemaPart(obj, this.schema)
  }

  initClassifierForKey (key) {
    if (!this.classifiers.hasOwnProperty(key)) {
      this.classifiers[key] = new Classifier()
    }
  }

  /**
   *
   * Parse Schema Part
   *
   * @param {Object} obj the current (part of the) object to examine
   * @param {Object} schemaPart Current schema part
   * @param {String} key Optional key used during iteration
   * @param {String} position Current position in array format
   */
  parseSchemaPart (obj, schemaPart, key, position = []) {
    // keep track of our position.
    if (key !== undefined) {
      position.push(key)
    }

    const path = this.getAbsolutePath(position)
    this.initClassifierForKey(path)

    schemaPart.type = typeOf(obj)

    if (schemaPart.type === 'object') {
      this.scanObject(obj, schemaPart, position)
    } else if (schemaPart.type === 'array') {
      this.scanArray(obj, schemaPart, position)
    } else {
      this.scanPrimitive(path, obj, schemaPart, key)
    }
  }
}

module.exports = Leason
