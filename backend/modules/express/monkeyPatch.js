// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');

module.exports = function monkeyPatch(app, module, options)
{
  if (options.View)
  {
    var originalLookup = options.View.prototype.lookup;

    options.View.prototype.lookup = function(name)
    {
      var colonIndex = name.indexOf(':');

      if (colonIndex === -1)
      {
        return originalLookup.call(this, name);
      }

      var moduleName = name.substring(0, colonIndex);
      var file = name.substring(colonIndex + 1);
      var loc = app.pathTo('modules', moduleName, 'templates', file);

      return this.resolve(path.dirname(loc), path.basename(loc));
    };
  }
};
