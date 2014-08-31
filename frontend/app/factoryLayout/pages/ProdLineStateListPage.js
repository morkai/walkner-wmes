// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/ProdLineStateListView'
], function(
  _,
  $,
  t,
  View,
  bindLoadingMessage,
  ProdLineStateListView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.model.load(true);
      }
    },

    breadcrumbs: function()
    {
      var breadcrumbs = [
        {
          label: t.bound('factoryLayout', 'bc:layout'),
          href: '#factoryLayout'
        }
      ];

      if (this.options.rqlQuery)
      {
        var divisionTerm = _.find(
          this.options.rqlQuery.selector.args,
          function(term) { return term.name === 'eq' && term.args[0] === 'division'; }
        );

        if (divisionTerm)
        {
          breadcrumbs.push(divisionTerm.args[1]);
        }
      }

      return breadcrumbs;
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView(this.listView);
    },

    destroy: function()
    {
      this.model.unload();
      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.listView = new ProdLineStateListView({
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.load(false));
    }

  });
});
