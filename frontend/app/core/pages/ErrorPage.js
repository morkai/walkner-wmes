// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
