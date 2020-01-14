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

    title: t.bound('mor', 'BREADCRUMB:base'),

    className: function()
    {
      return this.editing ? 'is-editing' : '';
    },

    actions: function()
    {
      var page = this;

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
          privileges: ['MOR:MANAGE', 'FN:manager', 'MOR:MANAGE:USERS'],
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

            page.broker.publish('router.navigate', {
              url: '/mor' + (page.editing ? '?edit=1' : ''),
              trigger: false,
              replace: true
            });
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
      this.editing = !!this.options.editing && user.isAllowedTo('MOR:MANAGE', 'FN:manager', 'MOR:MANAGE:USERS');
      this.view = new MorView({
        editing: this.editing,
        model: this.model
      });
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
