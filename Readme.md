#sass-import-resolve [![Build Status](https://travis-ci.org/dadish/sass-import-resolve.svg?branch=master)](https://travis-ci.org/dadish/sass-import-resolve)

Parses scss string and returns an array of filenames that the `@import` directives resolve.

## Installation

Run `npm install sass-import-resolver`.

## Usage

Say you have a file `/test/scss/screen.scss` with content...

```scss
@import
  "a",
  "../b/a",
  "c.scss",
  "_d"
;
```

to find out what file paths match to the patterns above, you do...
```js
var resolve = require('sass-import-resolve');
var fs = require('fs');
var sassStr = fs.readFileSync('screen.scss', {encoding : 'utf8'});

console.log(resolve('screen.scss', sassStr));

//=> [ '/test/scss/a.sass',
//=>   '/test/scss/_a.sass',
//=>   '/test/scss/a.scss',
//=>   '/test/scss/_a.scss',
//=>   '/test/b/a.sass',
//=>   '/test/b/_a.sass',
//=>   '/test/b/a.scss',
//=>   '/test/b/_a.scss',
//=>   '/test/scss/c.scss',
//=>   '/test/scss/_d.sass',
//=>   '/test/scss/_d.scss' ]
    
```
> __Please Note:__ This module does not know and care about your files. The file and it's content does not have to exist. It also doesn't care if the resolved paths exist. It's job is only to resolve sass `@import` directive.

### Rules
The module should be compatible with all the rules described in the sass [docmentation][sass-lang] for `@import` directive.

##### "a"
A regular name for a partial to import does resolve to 4 filenames.
```
a.scss
a.sass
_a.scss
_a.sass
```

##### "_a"
If the name is prefixed with underscore it only resolves to 2 filenames.
```
_a.scss
_a.sass
```

##### "a.scss"
If the name has a Sass or SCSS extension then it resolves only to 1 filename.
It doesn't matter if the name is prefixed with underscore or not.
```
a.scss
```

##### "a.css", "url('a')", "http://"
As per [sass documentation][sass-lang], there are a few circumstances when `@import` directive will not resolve at all:
- If the file’s extension is .css.
- If the filename begins with http://.
- If the filename is a url().
- If the @import has any media queries. (_this one is not implemented yet_)

## API

### resolve(filename, sassStr [, options])
Returns an `Array` of filenames that all `@import` directives in `sassStr` do resolve.
The filenames resolve relative to the `filename` argument.

#### Options

There are few options that affects the result of the resolve method.

#### options.resolveSass
Type: `Boolean`  
Default: `true`

Weather you want the Sass files to be resolved.

#### options.resolveScss
Type: `Boolean`  
Default: `true`

Weather you want the SCSS files to be resolved.

#### options.resolvePrefixed
Type: `Boolean`
Default: `true`

Weather you want the files that are prefixed with underscore to be resolved.

#### options.resolveUnprefixed
Type: `Boolean`
Default: `false`

Weather you want the files that are not prefixed with underscore to be resolved.

### Test
```
npm test
```

## License

MIT

[sass-lang]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#import