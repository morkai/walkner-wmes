// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/View',
  '../FteMasterEntry',
  '../views/FteEntryAddFormView'
], function(
  t,
  View,
  FteMasterEntry,
  FteEntryAddFormView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'fteMasterEntryAddForm',

    breadcrumbs: [
      {
        label: t.bound('fte', 'BREADCRUMBS:master:browse'),
        href: '#fte/master'
      },
      t.bound('fte', 'BREADCRUMBS:addForm')
    ],

    initialize: function()
    {
      this.view = new FteEntryAddFormView({
        model: new FteMasterEntry(),
        divisionFilter: function(division)
        {
          return division && division.get('type') === 'prod';
        }
      });

      this.listenTo(this.view, 'editable', function(fteMasterEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteMasterEntry.genClientUrl('edit'),
          trigger: true
        });
      });

      this.listenTo(this.view, 'uneditable', function(fteMasterEntry)
      {
        this.broker.publish('router.navigate', {
          url: fteMasterEntry.genClientUrl(),
          trigger: true
        });
      });
    }

  });
});
