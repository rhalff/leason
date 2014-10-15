'use strict';

var test = require('tape');
var Leason = require('../index');
var yaml = require('js-yaml');
var glob = require('glob');
var fs = require('fs');

var debug = false;

test('Leason test', function (t) {

    glob('./test/fixtures/*.yml', function(err, files) {

      var fixture, leason;

      var plan = files.length;

      t.plan(plan);

      for(var i = 0; i < files.length; i++) {

        leason = new Leason();

        fixture = yaml.safeLoad(
          fs.readFileSync(files[i], 'utf8')
        );

        if(!fixture.options || !fixture.options.skip) {

          // setting from fixture
          if(fixture.options) {
            leason.setOptions(fixture.options);
          }

          leason.parse(fixture.data);

          if(debug) {
            console.log(
              JSON.stringify(fixture.data, null, 2),
              JSON.stringify(leason.schema, null, 2),
              JSON.stringify(fixture.schema, null, 2)
            );
          }

          t.deepEqual(
            leason.schema,
            fixture.schema,
            files[i] + ' should detect schema'
          );

          } else {
            t.plan(--plan);
          }

        }

      t.end();

    });
});
