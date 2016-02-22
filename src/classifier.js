import {arrayCount, mode} from './util'
import typeOf from 'type-of'
import formats from './formats'

const formatKeys = Object.keys(formats)

export default class Classifier {
  constructor () {
    this.values = []
  }
 
  addValue(obj) {
    this.values.push(obj)
  }

  determineType () {
    let type
    for (let i = 0; i < this.values.length; i++) {
      type = typeOf(this.values[i])
    }
    return type
  }

  determineFormat (minCount) {
    // determine if *all* match the formatter
    const types = {}
    for (let type of formatKeys) {
      for (let i = 0; i < this.values.length; i++) {
        if (!types[type]) types[type] = [0, 0] // [count, empty]
        if (this.values[i]) { // do not check empty values
          if (formats[type](this.values[i])) {
            types[type][0]++
          }
        } else {
          types[type][1]++
        }
      }
    }
    for (let type of formatKeys) {
      if ((types[type][0] + types[type][1]) === this.values.length) {
        return type
      }
    }
    return false
  }

  /**
   * Tries to determine whether the values look like enum values
   *
   * It does so by specifying a minimum set for determination.
   * And a maximum variant count.
   *
   * @param minCount minimum of values for valid test
   * @param maxHit maximum diversity
   * @returns {*}
   */
  determineEnum (minCount, maxVariant) {
    if (this.values.length >= minCount) {
      const count = arrayCount(this.values)
      const _enum = Object.keys(count)
      if (_enum.length <= maxVariant) {
        return _enum
      }
    }
    return false
  }

  determineDefault () {
    return mode(this.values)
  }
}
