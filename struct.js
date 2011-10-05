exports.isStruct = isStruct
exports.getStruct = getStruct
exports.parseStructName = parseStructName
exports.parseStruct = parseStruct

var Struct = require('./core').Struct
  , types = require('./types')
  , test = /^\{.*?\}$/
  , structs = {}

/**
 * Tests if the given arg is a Struct constructor or a string type describing
 * a struct (then true), otherwise false.
 */
function isStruct (type) {
  return !!type.__isStructType__ || test.test(type)
}

/**
 * Returns the struct constructor function for the given struct name or type.
 */
function getStruct (type) {
  // First check if a regular name was passed in
  var rtn = structs[type];
  if (rtn) return rtn;
  // If the struct type name has already been created, return that one
  var name = exports.parseStructName(type)
  //console.error('name: %s', name)
  rtn = structs[name];
  if (rtn) {
    //console.error('returning cached Struct')
    return rtn;
  }
  // Next parse the type structure
  var parsed = exports.parseStruct(type);
  // Otherwise we need to create a new Struct constructor
  var props = [];
  parsed.props.forEach(function (prop) {
    props.push([ types.map(prop[1]), prop[0] ])
  })
  return structs[parsed.name] = Struct(props)
}

function parseStructName (struct) {
  var s = struct.substring(1, struct.length-1)
    , equalIndex = s.indexOf('=')
  if (~equalIndex)
    s = s.substring(0, equalIndex)
  return s
}

/**
 * Parses a struct type string into an Object with a `name` String and
 * a `props` Array (entries are a type string, or another parsed struct object)
 */
function parseStruct (struct) {
  var s = struct.substring(1, struct.length-1)
    , equalIndex = s.indexOf('=')
    , rtn = {
        name: s.substring(0, equalIndex)
      , props: []
    }
  s = s.substring(equalIndex+1)
  var curProp = null
    , numBrackets = 0
    , entries = []
  addProp()
  for (var i=0; i < s.length; i++) {
    var cur = s[i]
    switch (cur) {
      case '"':
        if (numBrackets > 0)
          curProp.push(cur)
        else
          addProp()
        break;
      case '{':
      case '[':
      case '(':
        numBrackets++
        curProp.push(cur)
        break;
      case '}':
      case ']':
      case ')':
        numBrackets--
        curProp.push(cur)
        break;
      default:
        curProp.push(cur)
        break;
    }
  }
  addProp()
  function addProp () {
    if (curProp)
      entries.push(curProp.join(''))
    curProp = []
    numBrackets = 0
  }
  for (var i=1; i < entries.length; i+=2) {
    rtn.props.push([entries[i], entries[i+1]])
  }
  return rtn
}

/* Here's an alternate 'parseStruct' thanks to @austinbv
TODO: Benchmark this against the current version someday...

x = '"origin"{CGPoint="x"d"y"d}"size"{CGSize="width"d"height"d}';
var z = []
y = x.split(/([{][^}]+}|")/ig)
for(var i = 0; i < y.length; i++) {
  if (y[i] != '"' && y[i] != '') {
    z.push(y[i])
  }
}
console.log(z)

*/
