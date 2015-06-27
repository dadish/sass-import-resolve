var resolveImports = require('../');
var assert         = require('assert');
var path           = require('path');
var fs             = require('fs');
var _              = require('underscore');

var emptySassStr = {
  path : 'test/scss/empty.scss',
  str : fs.readFileSync('test/scss/empty.scss', {encoding : 'utf8'})
};

var multipleSassStr = {
  path : 'test/scss/multiple.scss',
  str : fs.readFileSync('test/scss/multiple.scss', {encoding : 'utf8'})
};

var noneSassStr = {
  path : 'test/scss/none.scss',
  str : fs.readFileSync('test/scss/none.scss', {encoding : 'utf8'})
};

var oneSassStr = {
  path : 'test/scss/one.scss',
  str : fs.readFileSync('test/scss/one.scss', {encoding : 'utf8'})
};

var oneExtensionSassStr = {
  path : 'test/scss/one_extension.scss',
  str : fs.readFileSync('test/scss/one_extension.scss', {encoding : 'utf8'})
};

var oneExternalSassStr = {
  path : 'test/scss/one_external.scss',
  str : fs.readFileSync('test/scss/one_external.scss', {encoding : 'utf8'})
};

var onePrefixedSassStr = {
  path : 'test/scss/one_prefixed.scss',
  str : fs.readFileSync('test/scss/one_prefixed.scss', {encoding : 'utf8'})
};

var twoSassStr = {
  path : 'test/scss/two.scss',
  str : fs.readFileSync('test/scss/two.scss', {encoding : 'utf8'})
};

var twoIndentedSassStr = {
  path : 'test/scss/two_indented.scss',
  str : fs.readFileSync('test/scss/two_indented.scss', {encoding : 'utf8'})
};

var cssImportSassStr = {
  path : 'test/scss/css_import.scss',
  str : fs.readFileSync('test/scss/css_import.scss', {encoding : 'utf8'})
};

describe('resolveImports()', function () {
  
  it('should throw error if the first argument is not a `string`', function () {
    assert.throws(function () {
      resolveImports();
    });
    assert.throws(function () {
      resolveImports(null, 'string');
    });
    assert.throws(function () {
      resolveImports(100, 's');
    });
    assert.throws(function () {
      resolveImports([], 's');
    });
    assert.throws(function () {
      resolveImports({}, 's');
    });
    assert.throws(function () {
      resolveImports('', 's');
    });
  });

  it('should throw error if the second argument is not a `string`', function () {
    assert.throws(function () {
      resolveImports();
    });
    assert.throws(function () {
      resolveImports('s', null);
    });
    assert.throws(function () {
      resolveImports('s', 100);
    });
    assert.throws(function () {
      resolveImports('s', []);
    });
    assert.throws(function () {
      resolveImports('s', {});
    });
    assert.throws(function () {
      resolveImports('s', '');
    });
  });

  it('should return an `Array`', function () {
    assert.strictEqual(true, _.isArray(resolveImports(oneSassStr.path, oneSassStr.str)));
  });

  describe('with default options it...', function () {

    it('should resolve to 4 variants for single import', function () {
      assert.strictEqual(4, resolveImports(oneSassStr.path, oneSassStr.str).length);
    });

    it('should resolve to 8 variants for two imports', function () {
      assert.strictEqual(8, resolveImports(twoSassStr.path, twoSassStr.str).length);
    });

    it('should resolve to 2 variants if import is prefixed', function () {
      assert.strictEqual(2, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str).length);
    });
    
  });

  it('should always resolve to 1 variant for single import with a `.scss` or `.sass` extension', function () {
    assert.strictEqual(1, resolveImports(oneExtensionSassStr.path, oneExtensionSassStr.str).length);
    assert.strictEqual(1, resolveImports(oneExtensionSassStr.path, oneExtensionSassStr.str, {
      resolveSass : false,
      resolveScss : false,
      resolvePrefixed : false,
      resolveUnprefixed : false
    }).length);
  });

  it('should not resolve imports with `.css` extension, that are wrapped in `url()` and that begins with `http://`', function () {
    assert.strictEqual(0, resolveImports(cssImportSassStr.path, cssImportSassStr.str).length);
  });

  it('should handle all possible indentation between `@import` and `;` strings', function () {
    assert.strictEqual(true, _.isArray(resolveImports(twoIndentedSassStr.path, twoIndentedSassStr.str)));
    assert.strictEqual(8, resolveImports(twoIndentedSassStr.path, twoIndentedSassStr.str).length);
  });

  it('should resolve to paths that are outside the directory', function () {
    var scss, sass, scssPrefixed, sassPrefixed;
    scss = path.resolve('test/a.scss');
    sass = path.resolve('test/a.sass');
    scssPrefixed = path.resolve('test/_a.scss');
    sassPrefixed = path.resolve('test/_a.sass');

    assert.strictEqual(true, _(resolveImports(oneExternalSassStr.path, oneExternalSassStr.str)).some(function (item) {
      return item === scss;
    }));
    assert.strictEqual(true, _(resolveImports(oneExternalSassStr.path, oneExternalSassStr.str)).some(function (item) {
      return item === sass;
    }));
    assert.strictEqual(true, _(resolveImports(oneExternalSassStr.path, oneExternalSassStr.str)).some(function (item) {
      return item === scssPrefixed;
    }));
    assert.strictEqual(true, _(resolveImports(oneExternalSassStr.path, oneExternalSassStr.str)).some(function (item) {
      return item === sassPrefixed;
    }));
  });

  it('should return empty `Array` if the `@import` is empty', function () {
    assert.strictEqual(0, resolveImports(emptySassStr.path, emptySassStr.str).length);
  });

  it('should return empty `Array` if there is no `@import`', function () {
    assert.strictEqual(0, resolveImports(noneSassStr.path, noneSassStr.str).length);
  });

  it('should handle mutiple `@imports`', function () {
    assert(resolveImports(multipleSassStr.path, multipleSassStr.str).length);
  });

  describe('for single, unprefixed import it should resolve to ...', function () {

    it('2 variants if `resolveSass` option is `false`', function () {
      assert.strictEqual(2, resolveImports(oneSassStr.path, oneSassStr.str, {resolveSass : false}).length);
    });

    it('2 variants if `resolveScss` option is `false`', function () {
      assert.strictEqual(2, resolveImports(oneSassStr.path, oneSassStr.str, {resolveScss : false}).length);
    });

    it('2 variants if `resolvePrefixed` option is `false`', function () {
      assert.strictEqual(2, resolveImports(oneSassStr.path, oneSassStr.str, {resolvePrefixed : false}).length);
    });

    it('2 variants if `resolveUnprefixed` option is `false`', function () {
      assert.strictEqual(2, resolveImports(oneSassStr.path, oneSassStr.str, {resolveUnprefixed : false}).length);
    });

    it('1 variant if `resolveSass` and `resolvePrefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(oneSassStr.path, oneSassStr.str, {resolveSass : false, resolvePrefixed : false}).length);
    });

    it('1 variant if `resolveSass` and `resolveUnprefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(oneSassStr.path, oneSassStr.str, {resolveSass : false, resolveUnprefixed : false}).length);
    });

    it('1 variant if `resolveScss` and `resolvePrefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(oneSassStr.path, oneSassStr.str, {resolveScss : false, resolvePrefixed : false}).length);
    });

    it('1 variant if `resolveScss` and `resolveUnprefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(oneSassStr.path, oneSassStr.str, {resolveScss : false, resolveUnprefixed : false}).length);
    });

    it('0 variant if `resolveSass` and `resolveScss` options are `false`', function () {
      assert.strictEqual(0, resolveImports(oneSassStr.path, oneSassStr.str, {resolveSass : false, resolveScss : false}).length);
    });

    it('0 variant if `resolvePrefixed` and `resolveUnprefixed` are `false`', function () {
      assert.strictEqual(0, resolveImports(oneSassStr.path, oneSassStr.str, {resolvePrefixed : false, resolveUnprefixed : false}).length);
    });

  });

  describe('for single, prefixed import it should resolve to...', function () {
    
    it('2 variants if `resolvePrefixed` option is `false`', function () {
      assert.strictEqual(2, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolvePrefixed : false}).length);
    });

    it('2 variants if `resolveUnprefixed` option is `false`', function () {
      assert.strictEqual(2, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveUnprefixed : false}).length);
    });

    it('1 variants if `resolveSass` and `resolvePrefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveSass : false, resolvePrefixed : false}).length);
    });

    it('1 variants if `resolveSass` and `resolveUnprefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveSass : false, resolveUnprefixed : false}).length);
    });

    it('1 variants if `resolveScss` and `resolvePrefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveScss : false, resolvePrefixed : false}).length);
    });

    it('1 variants if `resolveScss` and `resolveUnprefixed` options are `false`', function () {
      assert.strictEqual(1, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveScss : false, resolveUnprefixed : false}).length);
    });

    it('0 variants if `resolveScss` and `resolveSass` options are `false`', function () {
      assert.strictEqual(0, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolveSass : false, resolveScss : false}).length);
    });

    it('2 variants if `resolvePrefixed` and `resolveUnprefixed` options are `false`', function () {
      assert.strictEqual(2, resolveImports(onePrefixedSassStr.path, onePrefixedSassStr.str, {resolvePrefixed : false, resolveUnprefixed : false}).length);
    });

  });

});