import merge from 'lodash/merge'
import {k_combinations as combN} from './vendor/combinations'
import {objectValues, omitter} from './util'

/**
 *  Currently expects to merge schema.items
 */
export default class SchemaMerger {
  static mergeSameItems (schema) {
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
  }

  static mergeSimilarItems (schema, similarCount) {
    if (schema.type === 'array') {
      const grouped = {}

      for (let i = 0; i < schema.items.length; i++) {
        const item = schema.items[i]
        const keys = Object.keys(item.properties).sort()
        combN(keys, similarCount).forEach((comb) => {
          const key = comb.join('-')
          if (!grouped.hasOwnProperty(key)) {
            grouped[key] = []
          }
          // register ourselfs as a member of this combination
          grouped[key].push(item)
        })
      }

      const list = objectValues(grouped)
      list.sort((a, b) => {
        if (b.length > a.length) {
          return 1
        } else if (b.length < a.length) {
          return -1
        }
        return 0
      })

      // we have a similarCount collection.
      // we are going to fill items now
      schema.items = []
      let seen = []
      for (let i = 0; i < list.length; i++) {
        const can = list[i].filter((item) => seen.indexOf(item) === -1)
        if (can.length) {
          schema.items.push(merge(...can)) // join our schemas
          seen = seen.concat(can)
        }
      }
    }
  }
}
