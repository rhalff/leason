import {arrayCount, mode} from './util'
import typeOf from 'type-of'

export default class Determine {
  constructor () {
    this.values = []
  }

  determineType () {
    let type
    for (let i = 0; i < this.values.length; i++) {
      type = typeOf(this.values[i])
    }
    return type
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
