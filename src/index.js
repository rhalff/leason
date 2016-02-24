'use strict'
import typeOf from 'type-of'
import Schema from './schema'
import SchemaMerger from './schemaMerger'
import Classifier from './classifier'

/**
 *
 * Leason
 *
 * @param {Object} options
 * @param {boolean} options.addTitle whether to add a title
 * @param {boolean} options.addDefault whether to add a default
 * @param {object} options.captureEnum whether to captureEnum
 * @param {number} options.captureEnum.minCount minimum count to determine enum
 * @param {number} options.captureEnum.maxVariant maximum variation to consider it an enum
 * @param {boolean} options.captureFormat whether to try and detect the format
 * @param {number} options.mergeSimilar merges similair objects if `number` of properties are the same.
 */
class Leason {
  constructor (options = {}) {
    this.schema = new Schema()

    this.classifiers = new Map()

    this.schemaMap = new Map()
    this.totalCount = 0

    this.stats = new Map()

    this.options = {
      addTitle: options.addTitle || false,
      addDefault: options.addDefault || false,
      addRequired: options.addRequired || false,
      captureEnum: options.captureEnum || {},
      captureFormat: options.captureFormat || {},
      mergeSimilar: options.mergeSimilar || null,
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
      if (!schema.hasOwnProperty('properties')) {
        schema.properties = {}
      }
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (!schema.properties.hasOwnProperty(key)) {
            schema.properties[key] = {}
          }
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
        this.parseSchemaPart(obj[i], schema.items[i], i, position.slice())
      }

      this.postProcessArray(schema)
    }
  }

  mergeSame (schema) {
    SchemaMerger.mergeSame(schema)
  }
  
  mergeSameItems (schema) {
    SchemaMerger.mergeSameItems(schema)
  }

  mergeSimilarItems (schema) {
    SchemaMerger.mergeSimilarItems(schema, this.options.mergeSimilar)
  }

  /**
   *
   * Reduces the set of items into unique definitions.
   *
   * @param {Array} items
   */
  postProcessArray (schema) {
    if (typeof this.options.mergeSimilar === 'number') {
      this.mergeSimilarItems(schema)
    } else {
      this.mergeSameItems(schema)
    }

    // if there is only one type, specify with object
    if (schema.items.length === 1) {
      schema.items = schema.items[0]
    }
  }

  setEnum (schema, path) {
    if ((schema.type === 'string' || schema.type === 'number') &&
      this.options.captureEnum.minCount > 0) {
      const classifier = this.classifiers.get(path)
      const _enum = classifier.determineEnum(
        this.options.captureEnum.minCount,
        this.options.captureEnum.maxVariant
      )
      if (_enum) {
        schema.enum = _enum
      }
    }
  }

  setFormat (schema, path) {
    if (schema.type === 'string' && this.options.captureFormat.minCount > 0) {
      const classifier = this.classifiers.get(path)
      const _format = classifier.determineFormat(
        this.options.captureFormat.minCount
      )
      if (_format) {
        schema.format = _format
      }
    }
  }

  setPrimitiveType (schema, path) {
    const classifier = this.classifiers.get(path)
    const type = classifier.determineType()
    schema['type'] = type
  }

  setTitle (schema, key) {
    if (key && this.options.addTitle) {
      schema.title = this.options.setTitle(key)
    }
  }

  setDefault (schema, path) {
    if (this.options.addDefault) {
      const classifier = this.classifiers.get(path)
      schema['default'] = classifier.determineDefault()
    }
  }

  updateStats (path) {
    if (!this.stats.has(path)) {
      this.stats.set(path, {count: 0})
    }
    this.stats.get(path).count++
  }

  setRequired (schema, path, position) {
    if (this.options.addRequired) {
      const _path = path
      const classifier = this.classifiers.get(path)
      const _position = position.slice()
      const count = this.totalCount
      const name = _position.pop()
      const parent = this.schemaMap.get(this.getAbsolutePath(_position))
      if (classifier.isRequired(count)) {
        if (!parent.required) {
          parent.required = []
        }
        if (parent.required.indexOf(name) === -1) {
          parent.required.push(name)
        }
      } else {
        if (parent.required) {
          const idx = parent.required.indexOf(name)
          if (idx >= 0) {
            parent.required.splice(idx, 1)
            if (parent.required.length === 0) {
              delete parent.required
            }
          }
        }
      }
    }
  }

  scanPrimitive (obj, schemaPart, key, path, position) {
    const classifier = this.classifiers.get(path)

    classifier.addValue(obj)

    this.setTitle(schemaPart, key)

    // Note this is constantly being revaluated
    this.setDefault(schemaPart, path)
    this.setRequired(schemaPart, path, position)
    this.setPrimitiveType(schemaPart, path)
    this.setEnum(schemaPart, path)
    this.setFormat(schemaPart, path)
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
    this.totalCount++
    this.parseSchemaPart(obj, this.schema)
  }

  initClassifierForPath (path) {
    if (!this.classifiers.has(path)) {
      this.classifiers.set(path, new Classifier())
    }
  }

  setSchemaPath (path, schemaPart) {
    this.schemaMap.set(path, schemaPart)
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

    this.initClassifierForPath(path)
    this.updateStats(path)
    this.setSchemaPath(path, schemaPart)

    schemaPart.type = typeOf(obj)

    if (schemaPart.type === 'object') {
      this.scanObject(obj, schemaPart, position)
    } else if (schemaPart.type === 'array') {
      this.scanArray(obj, schemaPart, position)
    } else {
      this.scanPrimitive(obj, schemaPart, key, path, position)
    }
  }
}

module.exports = Leason
