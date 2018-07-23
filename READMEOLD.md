OUTDATED
========
DO NOT USE
==========

parser-creator
==============
```sh
npm install parser-creator
```
Say you want to make your own node.js based programming language, but creating a parser from scratch seems like too much work? This project is the solution! By creating a few files, writing some lines of code, and setting some basic things up, you can create your own language. Wanna base it inside of node? No problem! Add a custom file extension? Got that too! Support for uploading as a package to npm? Sure, that's fine with me AND supported! This powerful and free tool has many capabilities I think you'll find nice.  
  
View the docs at [this site](https://legomaster3650.gitbook.io/parser-creator).

Usage
=====
**Setting up a parser**
First, install it as a dependency. Then, in the file you want to call parsing from, add the following code.  
```js
var parserCreator = require('parser-creator');
```  
Once you've required parser-creator, you'll want to make a new parser.  
```js
var parser = new parserCreator.parser();
```  
You also can include some json options like this:  
```js
var options = {
	main: "./parser.js"
};
var parser = new parserCreator.parser(options);
```  
When you include options, you can change where things are.  
The option I used is the "main" option, which defines the main script for your parser to use. The main program default is `./parser.js`, which looks for the file parser.js in the same directory as the file you're making the parser from.  
  
**Scripting a parser**  
Now that you've defined your parser's location, you'll want to actually create your parser. In order to create a parser, you'll need to first make the handler. There are 2 types of handler: text and file. Text handlers read strings and parse them, file handlers allow you to make file parsers and define file extensions, but this tutorial just shows string handling. A handler is a string handler by default.  
```js
var parserCreator = require('parser-creator');
var handler = new parserCreator.handler();
```  
Handlers set up most of the hard lifting. When you parse something, it is split up in definable ways. Let's go back to the file where we set up the parser.
  
**Parsing**  
Before you do any of the handling, you need to set up _methods_. Methods are what you pass the text you want to parse through. Methods come as text and file types too, and we will use a text parser for this tutorial as well. First, in the file you initialized your parser in, add the following script:  
```js
var options = {
	path: "./method.js"
};
var method = new parser.method(options);
```  
You likely noticed this has an option for a file too. That's the `path` attribute, which defines the method's script. You would use this method to parse text. Here's an example:  
```js
console.log(parser.parse(method, 'submethod', 'Text to parse'));
```  
This would log a text output from a program using the method in the variable 'method' as described above, with the submethod of 'submethod', using the parser 'parser'  
  
**Methods**  
So now we have a parser expecting a method for the text and a parser to run it through. Before making an parsing, we need to make a method. Methods are what split up our program.  
You've seen there are 2 method types, method and submethod. Methods are the container files for submethods (like method.js) and submethods are the scripts that parse programs. In a method file, you initialize it like you would probably expect:  
```js
var parserCreator = require('parser-creator');
var method = new parserCreator.method();
```  
The difference between making a method pointer (like above in the 'parsing' section) and defining a method is method pointers are assigned to an already constructed parser, but methods are a file that defines itself from the parser-creator package's core.  
If you want to make a method actually have functionality, you need a submethod. Submethods are called when you parse your program, and they are called via names. Here's the skeleton for a normal submethod named 'submethod':  
```js
method.submethod('submethod', (submethod, code) => {
  //submethod contents
});
```  
This may seem a bit confusing, so I'll go over each part.  
`method.submethod` is the caller for a submethod.  
`'submethod'` is the name of the submethod.  
`submethod` is the variable for the submethod's object to go into for usage of submethod tools.  
`code` is the variable for the code you want the submethod to dissect.  
`=>` is another way to write `function`.  
`{}` is the submethod's script.  
Hopefully you understand that bit now.  
Submethods have tools for the code assigned to the `submethod` variable.  
Here's a 'basic' javascipt-like script inside of the submethod from before:  
```js
method.submethod('submethod', (submethod, code) => {
  var tools = submethod.tools(); //simplifies submethod tool calls
  var lines = tools.lines(code); //split by line breaks (auto-detecting)
  var splitlines = tools.splitter(lines, '.'); //split by a character
  var brackets = tools.brackets(splitlines, '(', ')'); //split by 2 characters, a start and end one
  var commas = tools.splitter(brackets, ',');
  tools.buildCustom('customtool', function (tool, code) { //bulld a new custom tool. use this instead of just a function, as this adds some support structure to the 'code' input that allows easier parsing using 'tool'
    var tools2 = tool.tools(); //initialises tools for the function. don't reuse the submethod's tools, as this function is counted partially outside of the submethod.
    var escaped = tools2.escape(code, '@$'); //flags are tagged with '@$' so this will flag the text as itself when decoded but keeps it from causing a fake flag.
    var flaggedbrackets = tools2.flagged.brackets(escaped, ['\'', "\""], ['\'', "\""], 'string'); //splits sections like js strings, but flags them as strings so you can identify them.
  }); //scripted to parse for javascript-style strings AND add flags titled string. also has character escapes to prevent conflict with the flags.
  var stringed = tools.custom(commas, 'customtool'); //applies custom tool to code after commas.
  submethod.result(stringed); //returns the final code to be proccessed by the parser.
});
```  
That large piece of code will first seperate by lines, then by periods, then pull out brackets, seperate by comma, and seperate+label by strings. This is not a perfect javascript-style parser, as it would accept things like commas outside of parentheses. you need to define your rules in order and stricly, such as labelling parentheses to be the only acceptors of commas, and labelling parentheses alltogether. See the documentation for more on methods.  

**Parsers**  
Finally, we talk about parsers. You know, those things I talked about earlier. This is where the magic happens. All the conviniences in methods were just for passing on to parsers. If you don't use a method, don't use this package. Many powerful parser-creator tools are more easily utilised by using a method to pass info onto parsers, such as flags. First, you need to add your listener. Remember how the above submethod is named submethod? You listen for submethods by names. Here is an example of listening for 'submethod' via the handler defined already by the variable 'handler'
```js
handler.listen('submethod', (parsing, code) => {
  //stuff goes here, code is the code, parsing is for use with the listener
});
```

