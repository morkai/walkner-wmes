// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/core/pages/ListPage',
  '../views/MrpControllerListView'
], function(
  t,
  ListPage,
  MrpControllerListView
) {
  'use strict';

  return ListPage.extend({

    ListView: MrpControllerListView,

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('mrpControllers', 'PAGE_ACTION:toggleDeactivated'),
        icon: 'toggle-on',
        className: 'active',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.classList.toggle('active');
          page.view.toggleDeactivated(!btnEl.classList.contains('active'));

          return false;
        }
      }].concat(ListPage.prototype.actions.call(this));
    }

  });
});
