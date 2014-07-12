// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/user',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/printableList'
], function(
  t,
  user,
  View,
  ActionFormView,
  PaginationView,
  printableListTemplate
) {
  'use strict';

  return View.extend({

    template: printableListTemplate,

    serialize: function()
    {
      return {
        className: this.className || '',
        columns: this.serializeColumns(),
        rows: this.serializeRows()
      };
    },

    serializeColumns: function()
    {
      var nlsDomain = this.collection.getNlsDomain();
      var columns;

      if (Array.isArray(this.options.columns))
      {
        columns = this.options.columns;
      }
      else if (Array.isArray(this.columns))
      {
        columns = this.columns;
      }
      else
      {
        columns = [];
      }

      return columns.map(function(propertyName)
      {
        return {id: propertyName, label: t(nlsDomain, 'PROPERTY:' + propertyName)};
      });
    },

    serializeRows: function()
    {
      return this.collection.toJSON();
    },

    afterRender: function()
    {
      this.listenToOnce(this.collection, 'reset', this.render);
    },

    fitToPrintablePage: function(maxPageHeight)
    {
      var $tableTpl = this.$('table');
      var theadHeight = $tableTpl.find('thead').outerHeight();
      var pages = [[]];
      var currentPageHeight = theadHeight;
      var view = this;

      this.$('tbody > tr').each(function()
      {
        var $tr = view.$(this);
        var trHeight = $tr.height();

        if (currentPageHeight + trHeight > maxPageHeight)
        {
          currentPageHeight = theadHeight;

          pages[pages.length - 1].forEach(function($tr)
          {
            $tr.detach();
          });

          pages.push([]);
        }

        currentPageHeight += trHeight;

        pages[pages.length - 1].push($tr);
      });

      $tableTpl.find('tbody').empty();

      var $pages = pages.map(function($trs)
      {
        var $table = $tableTpl.clone();
        var $tbody = $table.find('tbody');

        $trs.forEach(function($tr)
        {
          $tbody.append($tr.detach());
        });

        return $table;
      });

      $tableTpl.remove();

      return $pages;
    }
  });
});
