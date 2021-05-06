// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/reports/util/formatTooltipHeader',
  '../../EngagementReport',
  'app/suggestions/templates/engagement/tables'
], function(
  _,
  $,
  View,
  formatTooltipHeader,
  EngagementReport,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 100);

      this.dataTables = [];

      this.listenTo(this.model, 'change:groups', this.render);

      $(window).on('resize.' + this.idPrefix, this.onResize);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix, this.onResize);

      this.destroyDataTables();
    },

    getTemplateData: function()
    {
      return {
        formatHeader: this.model.get('interval') !== 'none'
          ? formatTooltipHeader.bind(this)
          : () => this.t('engagement:title:none'),
        groups: this.model.get('groups'),
        counters: EngagementReport.COUNTERS
      };
    },

    beforeRender: function()
    {
      this.destroyDataTables();
    },

    afterRender: function()
    {
      this.createDataTables();
    },

    destroyDataTables: function()
    {
      this.dataTables.forEach(dt =>
      {
        dt.destroy();
      });

      this.dataTables = [];
    },

    createDataTables: function()
    {
      const $tables = this.$('table');

      this.model.get('groups').forEach((group, i) =>
      {
        this.createDataTable($tables.eq(i), group, $tables.length);
      });
    },

    createDataTable: function($table, group, groupCount)
    {
      const dt = $table.dataTable({
        autoWidth: false,
        info: false,
        ordering: true,
        orderMulti: true,
        order: [[0, 'asc']],
        paging: false,
        processing: false,
        searching: false,
        scrollX: true,
        scrollY: 282 * (groupCount === 1 ? 2 : 1),
        scrollCollapse: true,
        fixedColumns: 1,
        columnDefs: [
          {
            targets: 0,
            type: 'locale',
            width: '230px'
          },
          {
            targets: [1, 2, 3, 4, 5, 6, 7, 8],
            type: 'num',
            width: '72px',
            createdCell: (td, cellData) =>
            {
              if (cellData === '0')
              {
                td.classList.add('is-zero');
              }
            }
          },
          {
            targets: 9,
            orderable: false
          }
        ]
      }).DataTable(); // eslint-disable-line new-cap

      this.dataTables.push(dt);
    },

    resize: function()
    {
      this.dataTables.forEach(dt => dt.draw());
    }

  });
});
