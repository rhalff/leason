var test = require('tape');
var Leason = require('../index');
var yaml = require('js-yaml');
var glob = require('glob');
var fs = require('fs');

test('Leason test', function (t) {

    glob('./test/fixtures/*.yml', function(err, files) {

      var json, fixture, leason;

      t.plan(files.length);

      for(var i = 0; i < files.length; i++) {

        leason = new Leason();

        fixture = yaml.safeLoad(
          fs.readFileSync(files[0], 'utf8')
        );

        leason.parse(fixture.data);

        t.deepEqual(
          leason.schema,
          fixture.schema,
          files[i] + ' should detect schema'
        );

      }

      t.end();

    });
});
