// Extend: creates whitespaces indent
jasmine.StringPrettyPrinter.prototype.getIndent = function () {
    var whiteSpaces = "",
        i;
        
    for (i = 0; i < this.ws; i++) {
        whiteSpaces += " ";
    }

    return whiteSpaces;
};

// Override: pre-format object
jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
  var self = this,
      first = true,
      indent;
      
  this.append('{\n');
  if(!this.ws) {
      this.ws = 0;
  }
  this.ws += 4;
  indent = this.getIndent();
  var i = 0;
  this.iterateObject(obj, function(property, isGetter) {
      
    if (first) {
      first = false;
    } else {
      self.append(',\n');
    }

    self.append(indent + property);
    self.append(' : ');
    if (isGetter) {
      self.append('<getter>');
    } else {
      if (typeof obj[property] !== "object") {
         self.format(obj[property]);   
      } else {
         self.append("<Object>");
      }
    }
  });
  
  this.ws -= 4;
  indent = this.getIndent();
  
  this.append(indent + '\n'+ indent +'}');

};
