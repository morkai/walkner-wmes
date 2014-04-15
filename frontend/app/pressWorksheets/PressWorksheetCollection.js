// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../core/Collection',
  './PressWorksheet'
], function(
  _,
  Collection,
  PressWorksheet
) {
  'use strict';

  return Collection.extend({

    model: PressWorksheet,

    rqlQuery: 'select(rid,type,date,shift,master,operator,createdAt,creator)&sort(-date)&limit(15)',

    sync: function(type, model, options)
    {
      if (type === 'read' && !options.data)
      {
        var userTerm = _.find(this.rqlQuery.selector.args, function(term)
        {
          return term.name === 'eq' && term.args[0] === 'user';
        });

        if (userTerm)
        {
          this.rqlQuery.selector.args = _.without(this.rqlQuery.selector.args, userTerm);
        }

        options.data = this.rqlQuery.toString();

        if (userTerm)
        {
          this.rqlQuery.selector.args.push(userTerm);
        }
      }

      return Collection.prototype.sync.call(this, type, model, options);
    }

  });
});
