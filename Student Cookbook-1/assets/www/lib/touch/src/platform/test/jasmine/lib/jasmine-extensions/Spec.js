// Override: adds the error to the result
jasmine.Spec.prototype.fail = function (e) {
  var expectationResult = new jasmine.ExpectationResult({
    passed: false,
    message: e ? jasmine.util.formatException(e) : 'Exception'
  });
  // Modification start
  if (e instanceof Error) {
    this.hasError = true;
    expectationResult.error = e;
  }
  // Modification end
  this.results_.addResult(expectationResult);
};
