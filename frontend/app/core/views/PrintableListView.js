define([
  'jquery',
  'app/i18n',
  'app/user',
  '../View',
  './ActionFormView',
  './PaginationView',
  'app/core/templates/printableList'
], function(
  $,
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

    initialize: function()
    {

    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'reset', this.render);
    },

    fitToPrintablePage: function(maxPageHeight)
    {
      var $tableTpl = this.$('table');
      var theadHeight = $tableTpl.find('thead').outerHeight();
      var pages = [[]];
      var currentPageHeight = theadHeight;

      this.$('tbody > tr').each(function()
      {
        var $tr = $(this);
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
