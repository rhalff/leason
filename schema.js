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
 * Ok, I will not offer load schema functionality, or will I.
 * Well you have to, the json feeding is different from schema feeding.
 *
 * Let's just first not load a schema
 *
 * Leason will have to keep track on where it is, right now it does not.
 * Leason will have to keep track on where it is, right now it does not.
 *
 *
 */
function Schema(schema) {

  if(!(this instanceof Schema)) return new Schema();

  if(schema) {

    this.load(schema);

  }

}

Schema.prototype.load = function(/*schema*/) {

};

module.exports = Schema;
