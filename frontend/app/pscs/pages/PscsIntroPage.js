// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/pscs/templates/intro'
], function(
  _,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'blank',

    template: template,

    title: t.bound('pscs', 'BREADCRUMB:base'),

    destroy: function()
    {
      document.body.classList.remove('pscs');
      document.body.style.backgroundImage = '';
    },

    afterRender: function()
    {
      document.body.classList.add('pscs');
      document.body.style.backgroundImage = 'url(/app/pscs/assets/bg.' + _.random(1, 3) + '.jpg)';
    }
  });
});
