var _ = require('underscore'),
    Q = require('q'),
    opencareService = require('./lib/opencare_service');

function createSequences(possibilities, index, currentSequences) {
  var newList = [];

  if (currentSequences.length > 0) {
    for (var i = 0; i < currentSequences.length; i++) {
      _.each(possibilities, function(possibilityList, key) {
        var sequence = currentSequences[i];

        if (possibilityList[index]) {
          sequence += key;

          if (newList.indexOf(sequence) === -1) {
            newList.push(sequence);
          }
        }
      });
    }
  } else {
    var sequence = '';

    _.each(possibilities, function(possibilityList, key) {
      if (possibilityList[index]) {
        sequence += key;

        if (newList.indexOf(sequence) === -1) {
          newList.push(sequence);
        }
      }
    });
  }

  return newList;
}

function answerChallenge() {
  var id,
      partialSequence,
      sequenceLength;
  var p;
  var nucleotides = ['A', 'T', 'C', 'G'];
  var results = { 'A' : [],
                  'T' : [],
                  'C' : [],
                  'G' : []};
  var promises;
  var foundSequences;

  p = opencareService.startChallenge();

  return p.then(function(challengeInfo) {
    id = challengeInfo.uniq;
    partialSequence = challengeInfo.partialSequence;
    sequenceLength = challengeInfo.resultLength;
    var sequence = _.range(sequenceLength);

    promises = _.map(nucleotides, function(nucleotide) {
      return Q.all(_.map(sequence, function(index) {
        return opencareService.getLocation(index, nucleotide, id).then(function(expressed) {
          return expressed.expressed;
        });
      }));
    });

    Q.all(promises).then(function(nucLists) {
      for (var i = 0; i < nucleotides.length; i++) {
        results[nucleotides[i]] = nucLists[i];
      }

      var list = [];

      for (var i = 0; i < sequenceLength; i++) {
        list = createSequences(results, i, list);
      }

      foundSequences = _.filter(list, function(sequence) {
        return sequence.indexOf(partialSequence) > -1
      });

      console.log('Unique ID: ' + id);
      console.log('Partial Sequence: ' + partialSequence);
      console.log('Matched Sequences: ' + foundSequences);

      return opencareService.checkSequences(foundSequences, id);
    }).then(function(response) {
      console.log(response);
      console.log('done');
    }).catch(function(ex) {
      console.log(ex);
    });
  });
}

Q(true)
  .then(function() {
    return answerChallenge();
  })
  .catch(function(ex) {
    console.log(ex);
  })
  .done();
