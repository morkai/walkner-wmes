'use strict';

exports.autoIt3Wrapper = 'C:/Program Files (x86)/AutoIt3/SciTE/AutoIt3Wrapper/AutoIt3Wrapper.exe';
exports.makensis = 'C:/Program Files (x86)/NSIS/makensis.exe';
exports.googleChromePortable = 'C:/tools/GoogleChromePortable';

try
{
  var custom = require('./installer.json');

  Object.keys(custom).forEach(function(key)
  {
    exports[key] = custom[key];
  });
}
catch (err) {}
