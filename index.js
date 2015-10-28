var path = require('path');
var _    = require('underscore')

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

  importedItems = _(importedItems)
    .chain()
    .flatten()
    .filter(function (item) {
      return item;
    })
    .value();

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

  return _(versions).map(function (item) {
    return path.resolve(basePath, item);
  });
}

function resolveImports (targetPath, sassStr, settings) {
  var out, defaults;

  defaults = {
    resolveSass : true,
    resolveScss : true,
    resolveUnprefixed : true,
    resolvePrefixed : true
  };

  settings = settings || {};
  settings = _.defaults(settings, defaults);
  
  if (!_.isString(targetPath) || !targetPath) throw new Error('The first argument should be `string` that is not empty');
  if (!_.isString(sassStr) || !sassStr) throw new Error('The second argument should be `string` that is not empty');

  // resolve targetPath
  targetPath = path.resolve(targetPath);
  
  // get the import paths from the string
  out = parse(sassStr, 0, []);

  // normalize
  out = _(out).map(function (importItem) {
    return normalizeItem(importItem, getBase(targetPath), settings);
  });

  // flatten
  out = _(out).chain().flatten().unique().value();

  return out;
};

module.exports = resolveImports;