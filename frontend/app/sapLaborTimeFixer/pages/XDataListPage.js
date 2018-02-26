// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/pages/FilteredListPage',
  '../views/XDataFilterView',
  '../views/XDataListView'
], function(
  _,
  $,
  viewport,
  FilteredListPage,
  XDataFilterView,
  XDataListView
) {
  'use strict';

  return FilteredListPage.extend({

    layoutName: 'page',

    FilterView: XDataFilterView,
    ListView: XDataListView,

    actions: [],

    initialize: function()
    {
      var page = this;

      FilteredListPage.prototype.initialize.apply(page, arguments);

      var onDrag = page.onDrag.bind(page);

      $(document).on('dragenter.' + page.idPrefix, onDrag);
      $(document).on('dragleave.' + page.idPrefix, onDrag);
      $(document).on('dragover.' + page.idPrefix, onDrag);
      $(document).on('drop.' + page.idPrefix, page.onDrop.bind(page));
    },

    destroy: function()
    {
      FilteredListPage.prototype.destroy.apply(this, arguments);

      $(document).off('.' + this.idPrefix);
    },

    onDrag: function(e)
    {
      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      var view = this;

      e = e.originalEvent;

      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: view.t('MSG:drop:invalidFile')
        });
      }

      var file = _.find(e.dataTransfer.files, function(file)
      {
        return /xlsx?$/i.test(file.name)
          && (file.type === 'application/vnd.ms-excel'
            || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      });

      if (!file)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: view.t('MSG:drop:invalidFile')
        });
      }

      viewport.msg.saving();

      var formData = new FormData();

      formData.append('xData', file);

      var req = view.ajax({
        type: 'POST',
        url: '/sapLaborTimeFixer/xData',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        viewport.msg.savingFailed();
      });

      req.done(function(res)
      {
        viewport.msg.saved();

        if (res && res._id)
        {
          view.broker.publish('router.navigate', {
            url: '/sapLaborTimeFixer/xData/' + res._id,
            trigger: true,
            replace: false
          });
        }
      });
    }

  });
});
