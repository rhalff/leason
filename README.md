Leason
======

A JSON schema learner.

The concept of Leason is simple: learn the schema by feeding json documents.

Some goals:

- learn types
- learn formats (by testing validation)
- detect enum (just give up after 20) or a certain treshold.
- advanced. more filters to detect similarity.
- tresholds for each filter. 95% match, means 5% is probably invalid or not.
  that's why treshold.
- description filling
- optional title setter. just capitalize, humanize.
- auto refactor common parts into definitions, key from json is used as the key.
  you could say, refactor if something had properties or items. when a
  certain amount of nesting is going on. There could also be a 'same' pattern match.
  flattening everything to dotted path would be ideal for this. Just sort & detect
  the duplicates.

