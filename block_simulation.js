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

    simple: function(treatments, n) {
      var sequence = [];
      while (sequence.length < n) {
        sequence.push(treatments[Math.floor(treatments.length * Math.random())]);
      }
      return sequence;
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

    jitter: function(n, jitter) {
      return n + Math.round(n * jitter * (Math.random() - 0.5));
    },

    simulate: function(treatments, block_sizes, n, strata, reps) {
      var totals = [],
          total1 = [],
          total2 = [],
          total3 = [],
          n_per_stratum,
          stratum;
      for (var i=0; i < reps; i++) {
        var sequence = [],
            stratum1 = [],
            simple = [],
            simple1 = [];
        for (var j=0; j < strata; j++) {
          n_per_stratum = Math.ceil((n - sequence.length) / (strata - j));
          if ((strata - j) > 1) {
            /* Add some jitter */
            n_per_stratum = this.jitter(n_per_stratum, 0.4);
          }
          stratum = this.sequence(treatments, block_sizes, n_per_stratum);
          if (j % 2 === 0) {
            stratum1 = stratum1.concat(stratum);
          }
          sequence = sequence.concat(stratum);
        }
        simple = this.simple(treatments, n);
        simple1 = this.simple(treatments, Math.ceil(n/2));
        totals.push(this.counts(sequence));
        total1.push(this.counts(stratum1));
        total2.push(this.counts(simple));
        total3.push(this.counts(simple1));
      }
      return { totals: totals,
               stratum1: total1,
               simple: total2,
               simple1: total3 };
    },

    difference: function(results, treatments) {
      var diff = [], ideal = [], delta, total;
      for (var i=0; i < results.length; i++) {
        total = 0;
        ideal = [];
        for (var key in results[i]) {
          total += results[i][key];
        }
        for (var key in treatments) {
          if (typeof ideal[treatments[key]] == "undefined") {
            ideal[treatments[key]] = 0;
          }
          ideal[treatments[key]] += total / treatments.length;
        }
        delta = 0;
        for (var key in ideal) {
          delta += Math.abs((results[i][key] || 0)
                            - ideal[key]);
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
          freq = { "labels": [], "n": [], "percent": [], "cum": [] },
          total = 0,
          cumtotal = 0;
      for (var key in counts) {
        total += counts[key];
      }
      for (var key in counts) {
        cumtotal += counts[key];
        freq.labels.push(key);
        freq.n.push(counts[key]);
        freq.percent.push(Math.round(counts[key] * 1000 / total) / 10);
        freq.cum.push(Math.round(cumtotal * 1000 / total) / 10);
      }
      return freq;
    },

    mean: function(list) {
      var total = 0;
      for (var i=0; i < list.length; i++) {
        total += list[i];
      }
      return total/list.length;
    },

    RMS: function(differences) {
      var I2 = [];
      for (var i=0; i < differences.length; i++) {
        I2.push(Math.pow(differences[i], 2));
      }
      return Math.pow(this.mean(I2), 0.5);
    }

  }

  return SE;
}(SE || {}));
