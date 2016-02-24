'use strict'

import Leason from '../src/index'
import yaml from 'js-yaml'
import glob from 'glob'
import fs from 'fs'

const debug = false

describe('Leason test', () => {
  const files = glob.sync('./test/fixtures/*.yml')
  for(let i = 0; i < files.length; i++) {
    it(`${files[i]} should detect schema`, () => {
      const leason = new Leason()
      const fixture = yaml.safeLoad(
        fs.readFileSync(files[i], 'utf8')
      )

      if(!fixture.options || !fixture.options.skip) {
        // setting from fixture
        if(fixture.options) {
          leason.setOptions(fixture.options)
        }

        if (Array.isArray(fixture.data)) {
          fixture.data.forEach((_data) => {
            leason.parse(_data)
          }) 
        } else {
          leason.parse(fixture.data)
        }

        if(debug) {
          console.log(
            JSON.stringify(fixture.data, null, 2),
            JSON.stringify(leason.schema, null, 2),
            JSON.stringify(fixture.schema, null, 2)
          )
        }
        expect(JSON.stringify(leason.schema))
          .to.eql(JSON.stringify(fixture.schema))
      }
    })
  }
})
