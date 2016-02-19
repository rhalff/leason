/**
 * Schema
 */
export default class Schema {
  constructor (schema) {
    if (schema) {
      this.load(schema)
    }
  }

  load (/* schema */) {}
}

module.exports = Schema
