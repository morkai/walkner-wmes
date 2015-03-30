// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function idAndLabel(model, more)
  {
    var result = {
      id: model.id,
      text: model.getLabel()
    };

    if (more)
    {
      _.extend(result, more);
    }

    return result;
  };
});
