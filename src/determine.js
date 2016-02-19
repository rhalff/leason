import {arrayUnique, mode} from './util'
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

  // this has to has a treshold
  determineEnum () {
    return arrayUnique(this.values)
  }

  determineDefault () {
    return mode(this.values)
  }
}
