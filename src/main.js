console.info("parser-creator module loaded successfully")

function mapArray (array, action, carry) {
  var i;
  var mapped = []
  for (i = 0; i < array.length; i++) {
    var arrseg = array[i]
    if (Array.isArray(arrseg)) {
      if (carry) {
        mapped.push(mapArray(arrseg, action, carry))
      } else {
        mapped.push(mapArray(arrseg, action))
      }
    } else {
      if (carry) {
        mapped.push(action(arrseg, carry))
      } else {
        mapped.push(action(arrseg))
      }
    }
  }
  return mapped
}

function flag (item, flagname) {
  return {content: item, flag: flagname}
}

module.exports.parser = function parser (options) {
  function mapArray (array, action, carry) {
    var i;
    var mapped = []
    for (i = 0; i < array.length; i++) {
      var arrseg = array[i]
      if (Array.isArray(arrseg)) {
        if (carry) {
          mapped.push(mapArray(arrseg, action, carry))
        } else {
          mapped.push(mapArray(arrseg, action))
        }
      } else {
        if (carry) {
          mapped.push(action(arrseg, carry))
        } else {
          mapped.push(action(arrseg))
        }
      }
    }
    return mapped
  }

  function flag (item, flagname) {
    return {content: item, flag: flagname}
  }
  var opts = {main: "./parser.js"}
  if (options.main) opts.main = options.main
  this.main = require(opts.main)
  this.method = function method (moptions) {
    var mopts = {path: "./method.js"}
    if (moptions.path) mopts.path = moptions.path
    this.path = mopts.path
  } //parser.method
  
  this.parse = function parse (method, submethod, text) {
    //setup data
    var mpath = require(method.path)
    var msub = mpath.submethods[submethod]
    var submethodobj = {
      tools: {
        lines: lines,
        splitter: splitter,
        brackets: brackets,
        escape: escape,
        ifflag: ifflag,
        getflag: getflag,
        getcont: getcont,
        getcontent: getcont,
        startswith: startswith,
        endswith: endswith
      }
    }
    var methodpassed = msub(submethodobj, text) //call submethod
    //parse return from method
    var hpath = this.main
    var hsub = hpath.handlers[submethod]
    var handlerobj = {
      ifflag: ifflag,
      getflag: getflag,
      getcont: getcont,
      getcontent: getcont,
      startswith: startswith,
      endswith: endswith
    }
    var parsereturn = mapArray(methodpassed, hsub, handlerobj)
    
    hsub(methodpassed)
    return parsereturn
  } //parser.parse()
  
} //parserCreator.parser()

var ifflag = function ifflag (input, flag) {
  if (input.flag) {
    if (input.flag = flag) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

var getflag = function getflag (input) {
  if (input.flag) {
    return input.flag
  } else {
    return false
  }
}

var getcont = function getcont (input) {
  if (input.isJSON) {
    return input.content
  } else {
    return false
  }
}

var startswith = function startswith (input, key) {
  if (input.slice(0, key.length) == key) {
    return true
  } else {
    return false
  }
}

var endswith = function endwith (input, key) {
    if (input.slice(input.length - key.length, input.length) == key) {
    return true
  } else {
    return false
  }
}

var lines = function lines (input, flagged) {
  if (flagged) {
    var datas = {
      type: "lines",
      flag: flagged
    }
  } else {
    var datas = {
      type: "lines"
    }
  }
  return mapArray(input, thandler, datas)
}

var splitter = function splitter (input, split, flagged) {
  if (flagged) {
    var datas = {
      type: "splitter",
      splitter: split,
      flag: flagged
    }
  } else {
    var datas = {
      type: "splitter",
      splitter: split
    }
  }
  return mapArray(input, thandler, datas)
}

var escape = function escape (input, key, flagged) {
  if (flagged) {
    var datas = {
      type: "escape",
      key: key,
      flag: flagged
    }
  } else {
    var datas = {
      type: "escape",
      key: key
    }
  }
  return mapArray (input, thandler, datas)
}

var brackets = function brackets (input, start, end, flagged) {
  if (flagged) {
    var datas = {
      type: "brackets",
      start: start,
      end: end,
      flag: flagged
    }
  } else {
    var datas = {
      type: "brackets",
      start: start,
      end: end
    }
  }
  return mapArray(input, thandler, datas)
}

var thandler = function thandler (input, data) {
  if (input) {
    var output = []
    if (typeof input != "string") input = input.toString()
    
    if (data.type == "lines") {
      var eol = require('os').EOL
      output = outflag(data, input.split(eol))
    }
    
    if (data.type == "splitter") {
      output = outflag(data, input.split(data.splitter))
    }
    
    if (data.type == "escape") {
      if (input.flag) {
        output = input
      } else {
        output = {content: input}
      }
    }
    
    if (data.type == "brackets") {
      var iii;
      var start = data.start
      var end = data.end
      var starts = []
      var tags = 0
      var tempput = []
      var opened = 0
      for (var iii = 0; iii < input.length; iii++) {
        var charat = input.charAt(iii)
        if (start != end) {
          if (charat == start) {
            if (iii != 0 && opened == 0) tempput.push(input.slice(0, iii - 1))
            starts.push(iii)
          }
          if (charat == end) {
            tempput.push(outflag(data, input.slice(starts.pop() + 1, iii - 1)))
            var lastend = iii
          }
        } else {
          var char = start
          if (charat == char) {
            if (tags == 0) {
              if (iii != 0 && opened == 0) tempput.push(input.slice(0, iii - 1))
              tags = iii
            } else {
              tempput.push(outflag(data, input.slice(tags + 1, iii - 1)))
              tags = 0
              var lastend = iii
            }
          }
        }
      }
      if (lastend < input.length) {
        tempput.push(input.slice(lastend, input.length))
      }
      output = tempput
    }
    
    function outflag (data, input) {
      var output = []
      if (data.flag) {
        if (Array.isArray(input)) {
          var ii;
          for (ii = 0; ii < input.length; ii++) {
            output[ii] = flag(input[ii], data.flag)
          }
        } else {
          output = flag(input, data.flag)
        }
        return output
      } else {
        return input
      }
    }
    return output
  } else {
    console.error('Error: Tried to parse nothing.')
  }
}

module.exports.method = function method () {
  module.exports.submethods = {}
  this.submethod = function submethod (name, script) {
    module.exports.submethods[name] = script
  }
} //parserCreator.method()

module.exports.handler = function handler () {
  module.exports.handlers = {}
  this.listen = function listen (name, script) {
    module.exports.handlers[name] = script
  }
} //parserCreator.handler()