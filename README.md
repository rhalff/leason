[![Build Status](https://travis-ci.org/rhalff/leason.png)](https://travis-ci.org/rhalff/leason)

Leason
======

A JSON schema learner.

[![NPM](https://nodei.co/npm/leason.png)](https://nodei.co/npm/leason/)

The concept of Leason is simple: learn the schema by feeding json documents.

Install:

```bash
npm i leason -g
```


CLI:
```bash
$ bin/leason

  Usage: leason [options]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -t, --title    add titles
    -d, --default  add defaults

  Examples:

    $ leason my.json
    $ cat my.json | leason > schema.json

```

Script:
```javascript

var Leason = require('leason');
var json = require('./package.json');

var leason = new Leason()
leason.parse(json);

console.log(leason.schema);

```

Result:
```javascript
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "version": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "main": {
      "type": "string"
    },
    "watch": {
      "type": "object",
      "properties": {
        "test": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "bin": {
      "type": "object",
      "properties": {
        "leason": {
          "type": "string"
        }
      }
    },
    "scripts": {
      "type": "object",
      "properties": {
        "test": {
          "type": "string"
        },
        "watch": {
          "type": "string"
        }
      }
    },
    "author": {
      "type": "string"
    },
    "license": {
      "type": "string"
    },
    "dependencies": {
      "type": "object",
      "properties": {
        "type-of": {
          "type": "string"
        },
        "commander": {
          "type": "string"
        }
      }
    },
    "devDependencies": {
      "type": "object",
      "properties": {
        "js-yaml": {
          "type": "string"
        },
        "tape": {
          "type": "string"
        },
        "tap-spec": {
          "type": "string"
        },
        "glob": {
          "type": "string"
        },
        "npm-watch": {
          "type": "string"
        },
        "jshint": {
          "type": "string"
        }
      }
    }
  }
}

```

As one can see there still is much to be desired.

Some goals:

- learn types
- learn formats (by testing validation)
- detect enum (just give up after 20) or a certain treshold.
- advanced. more filters to detect similarity.
- tresholds for each filter. 95% match, means 5% is probably invalid or not.
  that's why treshold.
- description filling
- optional title setter. just capitalize, humanize.
- auto refactor common parts into definitions.
