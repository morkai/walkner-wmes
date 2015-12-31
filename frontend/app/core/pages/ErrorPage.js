// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  '../View',
  'app/core/templates/error400',
  'app/core/templates/error401',
  'app/core/templates/error404'
], function(
  t,
  View,
  error400Template,
  error401Template,
  error404Template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'error',

    breadcrumbs: function()
    {
      return [
        t.bound('core', 'BREADCRUMBS:error', {
          code: this.options.code,
          codeStr: 'e' + this.options.code
        })
      ];
    },

    initialize: function()
    {
      /*jshint -W015*/

      var template;

      switch (this.options.code)
      {
        case 401:
          template = error401Template;
          break;

        case 404:
          template = error404Template;
          break;

        default:
          template = error400Template;
          break;
      }

      this.view = new View({template: template});
    }

  });
});
