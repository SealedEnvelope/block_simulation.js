$(function($) {
  module("Trial with two treatments");

  test("Varying block sizes", function() {
    function isA(element, index, array) {
      return element == "A";
    }

    equal(SE.simulation.block(["A", "B"], 2).length, 2);
    equal(SE.simulation.block(["A", "B"], 2).filter(isA).length, 1);
    equal(SE.simulation.block(["A", "B"], 4).length, 4);
    equal(SE.simulation.block(["A", "B"], 4).filter(isA).length, 2);
    equal(SE.simulation.block(["A", "B"], 5).length, 4);
    equal(SE.simulation.block(["A", "B"], 6).length, 6);
    equal(SE.simulation.block(["A", "B"], 6).filter(isA).length, 3);
    equal(SE.simulation.block(["A", "A", "B"], 9).length, 9);
    equal(SE.simulation.block(["A", "A", "B"], 9).filter(isA).length, 6);
  });

  test("Blocks are randomised", function() {
    notEqual(
      SE.simulation.block(["A", "B"], 20).join(""),
      SE.simulation.block(["A", "B"], 20).join(""),
      "This test may fail by chance occasionally - rerun tests"
    );
  });

  test("Generate sequence", function() {
    equal(SE.simulation.sequence(["A", "B"], [2, 4], 200).length, 200);
  });

  test("Counts", function() {
    var sequence = SE.simulation.sequence(["A", "B"], [2, 4], 100),
      counts = SE.simulation.counts(sequence);
    ok(counts.A > 45 && counts.A < 55, "Number allocated to A is 45-55");
    ok(counts.B > 45 && counts.B < 55, "Number allocated to B is 45-55");
  });

  test("Simulation", function() {
    var results = SE.simulation.simulate(["A", "B"], [2, 4], 50, 1, 10).totals;
    equal(results.length, 10);
    equal(results[0].A + results[0].B, 50);
    equal(results[1].A + results[1].B, 50);
    equal(results[2].A + results[2].B, 50);
  });

  test("Block size bigger than n", function() {
    var results = SE.simulation.simulate(["A", "B"], [200], 10, 1, 10).totals;
    equal(results[0].A + results[0].B, 10);
  });

  test("Simple randomisation", function() {
    var results = SE.simulation.counts(SE.simulation.simple(["A", "B"], 80));
    equal(results.A + results.B, 80);
    ok(results.A > 20);
    ok(results.B > 20);
  });

  test("Stratum1 same as totals with 1 strata", function() {
    var results = SE.simulation.simulate(["A", "B"], [2, 4], 50, 1, 10);
    deepEqual(results.totals, results.stratum1);
  });

  test("Stratified simulation", function() {
    var results = SE.simulation.simulate(["A", "B"], [2, 4], 50, 6, 10).totals;
    equal(results.length, 10);
    equal(results[0].A + results[0].B, 50);
    equal(results[1].A + results[1].B, 50);
    equal(results[2].A + results[2].B, 50);
  });

  test("Extreme stratified simulation", function() {
    var results = SE.simulation.simulate(["A", "B"], [2], 50, 300, 10).totals;
    equal(results.length, 10);
    equal(results[0].A + results[0].B, 50);
    equal(results[1].A + results[1].B, 50);
    equal(results[2].A + results[2].B, 50);
  });

  test("Stratum1 different to totals when stratified", function() {
    var results = SE.simulation.simulate(["A", "B"], [2, 4], 50, 6, 10);
    notDeepEqual(results.totals, results.stratum1);
  });

  test("2:1 ratio", function() {
    var results = SE.simulation.simulate(["A", "A", "B"], [6], 18, 1, 10).totals;
    equal(results.length, 10);
    equal(results[0].A, 12);
    equal(results[0].B, 6);
  });

  test("Differences", function() {
    var results = [
      { "A": 12, "B": 8 },
      { "A": 11, "B": 9 },
      { "A": 20 },
      { "A": 10, "B": 10 }],
      diff = SE.simulation.difference(results, ["A", "B"]);
    equal(diff.length, 4);
    equal(4, diff[0]);
    equal(2, diff[1]);
    equal(20, diff[2]);
    equal(0, diff[3]);
  });

  test("Differences 2:1", function() {
    var results = [
      { "A": 22, "B": 8 },
      { "A": 21, "B": 9 },
      { "A": 20, "B": 10 }],
      diff = SE.simulation.difference(results, ["A", "A", "B"]);
    equal(diff.length, 3);
    equal(4, diff[0]);
    equal(2, diff[1]);
    equal(0, diff[2]);
  });

  test("maxDifference", function() {
    var results = [
      { "A": 12, "B": 8 },
      { "A": 11, "B": 9 },
      { "A": 10, "B": 10 }],
      maxdiff = SE.simulation.maxDifference(results, ["A", "B"], 20);
    equal(maxdiff[0].A, 12);
    equal(maxdiff[0].B, 8);
    equal(maxdiff[1], 4);
  });

  test("Worst case scenario", function() {
    var results = [ { "A": 22, "B": 18 }, { "A": 22, "B": 19 } ],
      wcs = SE.simulation.maxDifference(results, ["A", "B"], 40);
    equal(wcs[0], results[0]);
    equal(wcs[1], 4);
  });

  test("Frequencies", function() {
    var results = [
      { "A": 22, "B": 18 },
      { "A": 21, "B": 19 },
      { "A": 20, "B": 20 },
      { "A": 19, "B": 21 },
      { "A": 18, "B": 22 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 }],
    diff = SE.simulation.difference(results, ["A", "B"]),
      freq = SE.simulation.frequency(diff);
    equal(freq.labels.join(" "), "0 2 4");
    equal(freq.n.join(" "), "6 2 2");
    equal(freq.percent.join(" "), "60 20 20");
    equal(freq.cum.join(" "), "60 80 100");
  });

  test("Mean", function() {
    var results = [
      { "A": 22, "B": 18 },
      { "A": 21, "B": 19 },
      { "A": 20, "B": 20 },
      { "A": 19, "B": 21 },
      { "A": 18, "B": 22 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 }],
    diff = SE.simulation.difference(results, ["A", "B"]),
      mean = SE.simulation.mean(diff);
    equal(mean, 1.2);
  });

  test("RMS", function() {
    var results = [
      { "A": 22, "B": 18 },
      { "A": 21, "B": 19 },
      { "A": 20, "B": 20 },
      { "A": 19, "B": 21 },
      { "A": 18, "B": 22 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 },
      { "A": 20, "B": 20 }],
    diff = SE.simulation.difference(results, ["A", "B"]),
      RMS = SE.simulation.RMS(diff);
    equal(RMS, 2);
  });

  module("Trial with three treatments");

  test("Differences", function() {
    var results = [
      { "A": 12, "B": 8, "C": 10 },
      { "A": 11, "B": 11, "C": 8 },
      { "A": 10, "B": 9, "C": 11 }],
      diff = SE.simulation.difference(results, ["A", "B", "C"]);
    equal(4, diff[0]);
    equal(4, diff[1]);
    equal(2, diff[2]);
  });

  test("Worst case scenario", function() {
    var results = [
      { "A": 12, "B": 8, "C": 10 },
      { "A": 11, "B": 11, "C": 8 },
      { "A": 10, "B": 9, "C": 11 }],
      wcs = SE.simulation.maxDifference(results, ["A", "B", "C"], 30);
    equal(wcs[0], results[0]);
    equal(wcs[1], 4);
  });


});
