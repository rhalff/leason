var should = require('should');
var Leason = require('../index');

describe('Json Schema Learner', function() {

  describe('Should be able to determine primitive type', function() {

    var ls;
    var json;

    beforeEach(function() {

      ls = Leason(json);

    });

    it('array', function() {

      var json = {
        "an-array": [],
        "a-bool-true": true,
        "a-bool-false": false,
        // when an int is detected and previous where floats
        // the type becomes integer. or if there is a treshold
        // the type beomces an integer after the treshold
        // and the float is marked as mismatch. (later version)
        "an-integer": 100,
        "a-float": 0.10,
        "a-null": null,
        "object": { "what": "ever" },
        "a-string": "test"
      };


      ls.parse(json);
      ls.schema.should.eql({});

    });

    it('boolean', function() {

    });

    it('integer', function() {

    });

    it('number', function() {

    });

    it('null', function() {

    });

    it('object', function() {

    });

    it('string', function() {

    });

  });

  describe('Should be able to detect', function() {

    it('email', function() {

    });

    it('date', function() {

    });

    it('date-time', function() {

    });

  });



});
