var SE = (function(SE) {

  SE.simulation = {
    randomise: function(list) {
      var map = [];
      var result = [];

      for (var i=0; i < list.length; i++) {
        map.push({
          index: i,
          value: Math.random()
        });
      }

      map.sort(function(a, b) {
        return a.value > b.value ? 1 : -1;
      });

      for (var i=0; i < map.length; i++) {
        result.push(list[map[i].index]);
      }
      return result;
    },

    block: function(treatments, block_size) {
      var block = [];
      for (var i=0; i < Math.floor(block_size / treatments.length); i++) {
        block = block.concat(treatments);
      }
      return this.randomise(block);
    },

    sequence: function(treatments, block_sizes, n) {
      var sequence = [];
      while (sequence.length < n) {
        sequence = sequence.concat(this.block(treatments, this.randomise(block_sizes)[0]));
      }
      return sequence.slice(0, n);
    },

    counts: function(sequence) {
      var counts = {};
      for (var i=0; i < sequence.length; i++) {
        if (typeof counts[sequence[i]] == "undefined") {
          counts[sequence[i]] = 1;
        } else {
          counts[sequence[i]]++;
        }
      }
      return counts;
    },

    simulate: function(treatments, block_sizes, n, strata, reps, uneven) {
      var results = [];
      var n_per_stratum;
      for (var i=0; i < reps; i++) {
        var sequence = [];
        for (var j=0; j < strata; j++) {
          if (uneven) {
            /* Early strata larger */
            if ((strata - j) > 1) {
              n_per_stratum = Math.ceil((n - sequence.length) / 2);
            } else {
              n_per_stratum = n - sequence.length;
            }
          } else {
            /* Equal size strata */
            n_per_stratum = Math.ceil((n - sequence.length) / (strata - j));
          }
          sequence = sequence.concat(
            this.sequence(treatments, block_sizes, n_per_stratum)
          );
        }
        results.push(this.counts(sequence));
      }
      return results;
    },

    difference: function(results, treatments, n) {
      var diff = [], ideal = [], delta;
      for (var i=0; i < treatments.length; i++) {
        if (typeof ideal[treatments[i]] == "undefined") {
          ideal[treatments[i]] = 0;
        }
        ideal[treatments[i]] += n / treatments.length;
      }
      for (var i=0; i < results.length; i++) {
        delta = 0;
        for (var key in ideal) {
          delta += Math.abs(results[i][key] - ideal[key]);
        }
        diff.push(delta);
      }
      return diff;
    },

    maxDifference: function(results, treatments, n) {
      var diff = this.difference(results, treatments, n),
        maxDiff = 0,
        max = 0;
      for (var i=0; i < diff.length; i++) {
        if (diff[i] > maxDiff) {
          max = i;
          maxDiff = diff[i];
        }
      }
      return [results[max], maxDiff];
    },

    frequency: function(list) {
      var counts = this.counts(list.sort(function(a,b) { return a - b; })),
        freq = { "labels": [], "n": [], "percent": [] },
        total = 0;
      for (var key in counts) {
        total += counts[key];
      }
      for (var key in counts) {
        freq.labels.push(key);
        freq.n.push(counts[key]);
        freq.percent.push(Math.round(counts[key] * 1000 / total) / 10);
      }
      return freq;
    },

    mean: function(list) {
      var total = 0;
      for (var i=0; i < list.length; i++) {
        total += list[i];
      }
      return total/list.length;
    }

  }

  return SE;
}(SE || {}));
