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
export default class Schema {
  constructor (schema) {
    if (schema) {
      this.load(schema)
    }
  }

  load (/* schema */) {}
}

module.exports = Schema
