// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/mor/views/MorView'
], function(
  $,
  t,
  user,
  View,
  MorView
) {
  'use strict';

  return View.extend({

    pageId: 'mor',

    layoutName: 'page',

    title: t.bound('mor', 'BREADCRUMBS:base'),

    actions: function()
    {
      var page = this;
      var canManage = user.isAllowedTo.bind(user, 'MOR:MANAGE', 'FN:manager', 'MOR:MANAGE:USERS');

      return [
        {
          label: t.bound('mor', 'PAGE_ACTION:addSection'),
          icon: 'plus',
          privileges: 'MOR:MANAGE',
          className: function()
          {
            return 'mor-action-addSection ' + (page.editing ? '' : 'hidden');
          },
          callback: function()
          {
            page.view.addSection();
          }
        },
        {
          label: t.bound('mor', 'PAGE_ACTION:editMode'),
          icon: 'edit',
          privileges: canManage,
          className: function()
          {
            return page.editing ? 'active' : '';
          },
          callback: function(e)
          {
            var btnEl = e.currentTarget.querySelector('.btn');

            btnEl.classList.toggle('active');
            page.el.classList.toggle('is-editing');

            page.editing = page.el.classList.contains('is-editing');

            $('.mor-action-addSection').toggleClass('hidden', !page.editing);

            page.view.toggleEditing(page.editing);
          }
        },
        {
          label: t.bound('mor', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'MOR:MANAGE',
          href: '#mor;settings'
        }
      ];
    },

    initialize: function()
    {
      this.editing = false;
      this.view = new MorView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
