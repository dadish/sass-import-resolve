var path = require('path');

// http://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

// http://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
function unique(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
}

function parse (content, index, importedItems) {
  var startIndex, endIndex, importKeyStart, importKeyEnd, extract;
  importKeyStart = '@import';
  importKeyEnd = ';';

  // We should extract everything between
  // `@import` and `;` strings
  startIndex = content.indexOf(importKeyStart, index);

  // If there is no importKeyStart then return
  if (startIndex === -1) return importedItems;

  // start from the end of the importKeyStart
  startIndex += importKeyStart.length;

  endIndex = content.indexOf(';', startIndex);

  extract = content.substring(startIndex, endIndex);

  // remove unnecessary character codes
  extract = extract.replace(/\s/g, '').replace(/"/g, '').replace(/'/g, '');

  // do not resolve if the import value ends with a `.css` string
  if (extract.length > 4 && extract.indexOf('.css') === extract.length - 4) extract = '';

  // do not resolve if the import value has a `url(` string 
  if (extract.indexOf('url(') === 0) extract = '';

  // do not resolve if the import value begins with `http://` string
  if (extract.indexOf("http://") === 0) extract = '';


  // if extract has a comma in it then split the string
  // because probably someone is importing multiple paths
  // with one importKeyStart
  if (extract.indexOf(',') !== -1) {
    extract = extract.split(',');
  }

  importedItems.push(extract);

  importedItems = flatten(importedItems)
    .filter(function (item) {
      return item;
    });

  return parse(content, endIndex, importedItems);
}

function getBase (path) {
  path = path.split('/');
  path.splice(path.length - 1, 1);
  return path.join('/');
}

function normalizeItem (importItem, basePath, settings) {
  var versions, lastIndex, lastStr, imp, withExtension;

  imp = importItem.split('/');
  last = imp.length - 1;
  lastStr = imp[last];

  // All possible filename versions that importItem resolves
  versions = [];

  withExtension = lastStr.indexOf('.scss') !== -1 && lastStr.indexOf('.scss') + 5 === lastStr.length;
  if (!withExtension) withExtension = lastStr.indexOf('.sass') !== -1 && lastStr.indexOf('.sass') + 5 === lastStr.length;

  if (withExtension) {
    return [path.resolve(basePath, importItem)];
  }

  if (settings.resolveSass) {
    if (lastStr.indexOf('_') !== 0 && settings.resolveUnprefixed) {
      // file with .sass extension
      imp[last] = lastStr + '.sass';
      versions.push(imp.join('/'));
    }

    if (lastStr.indexOf('_') !== 0 && settings.resolvePrefixed) {
      // prefixed file with .sass extension
      imp[last] = '_' + lastStr + '.sass';
      versions.push(imp.join('/'));
    }

    if (lastStr.indexOf('_') === 0) {
      // file with .sass extension
      imp[last] = lastStr + '.sass';
      versions.push(imp.join('/'));
    }

  }

  if (settings.resolveScss) {

    if (lastStr.indexOf('_') !== 0 && settings.resolveUnprefixed) {
      // file with .scss extension
      imp[last] = lastStr + '.scss';
      versions.push(imp.join('/'));
    }

    if (lastStr.indexOf('_') !== 0 && settings.resolvePrefixed) {
      // prefixed file with .scss extension
      imp[last] = '_' + lastStr + '.scss';
      versions.push(imp.join('/'));
    }

    if (lastStr.indexOf('_') === 0) {
      // file with .scss extension
      imp[last] = lastStr + '.scss';
      versions.push(imp.join('/'));
    }
    
  }

  return versions.map(function (item) {
    return path.resolve(basePath, item);
  });
}

function resolveImports (targetPath, sassStr, settings) {
  var out;

  settings = settings || {};

  settings = {
    resolveSass : settings.resolveSass === void 0 ? true : settings.resolveSass,
    resolveScss : settings.resolveScss === void 0 ? true : settings.resolveScss,
    resolveUnprefixed : settings.resolveUnprefixed === void 0 ? true : settings.resolveUnprefixed,
    resolvePrefixed : settings.resolvePrefixed === void 0 ? true : settings.resolvePrefixed
  };

  if (typeof targetPath !== 'string' || !targetPath) throw new Error('The first argument should be `string` that is not empty');
  if (typeof sassStr !== 'string' || !sassStr) throw new Error('The second argument should be `string` that is not empty');

  // resolve targetPath
  targetPath = path.resolve(targetPath);
  
  // get the import paths from the string
  out = parse(sassStr, 0, []);

  // normalize
  out = out.map(function (importItem) {
    return normalizeItem(importItem, getBase(targetPath), settings);
  });

  // flatten
  out = flatten(out);
  return unique(out);
};

module.exports = resolveImports;