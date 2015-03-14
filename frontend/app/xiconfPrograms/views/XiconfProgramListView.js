// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'xiconfPrograms-list',

    columns: ['name', 'updatedAt'],

    serializeRow: function(model)
    {
      var obj = model.serialize();

      obj.name += ' ' + obj.steps
        .filter(function(step) { return step.enabled; })
        .map(function(step)
        {
          return '<span class="label label-info label-' + step.type + '">' + step.type + '</span>';
        })
        .join(' ');

      return obj;
    }

  });
});
