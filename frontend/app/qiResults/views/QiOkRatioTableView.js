// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/core/View',
  '../dictionaries',
  'app/qiResults/templates/okRatioTable',
  'app/qiResults/templates/okRatioTotalsTable'
], function(
  _,
  $,
  t,
  user,
  View,
  qiDictionaries,
  template,
  renderOkRatioTotalsTable
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'mouseenter tr[data-key]': function(e)
      {
        if (this.selectedKey === null)
        {
          this.renderTotals(this.model.get('groups')[e.currentTarget.dataset.i]);
        }
      },

      'mouseleave #-monthly': function()
      {
        if (this.selectedKey === null)
        {
          this.renderTotals(this.model.get('total'));
        }
      },

      'click .is-clickable[data-property="month"]': function(e)
      {
        var $td = this.$(e.currentTarget);
        var $tr = $td.parent();
        var i = $tr[0].dataset.i;
        var key = $tr[0].dataset.key;

        if (this.selectedKey === key)
        {
          this.selectedKey = null;

          $td.removeClass('is-selected');
        }
        else
        {
          this.selectedKey = key;

          this.$('.is-selected').removeClass('is-selected');
          $td.addClass('is-selected');

          this.renderTotals(this.model.get('groups')[i]);
        }
      },

      'click .is-clickable[data-property="ratio"]': function(e)
      {
        var view = this;
        var $value = view.$(e.currentTarget);
        var $tr = $value.parent();
        var i = $tr[0].dataset.i;
        var key = +$tr[0].dataset.key;
        var oldValue = qiDictionaries.settings.getWhQty(key);
        var $form = $('<form></form>').submit(function() { hideAndSave(); return false; });
        var $input = $('<input class="form-control input-lg no-controls" type="number" min="0">')
          .val(oldValue)
          .on('keydown', function(e)
          {
            if (e.which === 27)
            {
              _.defer(hide);
            }
          })
          .css({
            position: 'absolute',
            width: '110px'
          })
          .appendTo($form);

        $form.appendTo($value);

        _.defer(function()
        {
          $input.select().on('blur', function() { _.defer(hideAndSave); });
        });

        function hide()
        {
          $form.remove();
        }

        function hideAndSave()
        {
          var newValue = parseInt($input.val(), 10);

          hide();

          if (isNaN(newValue) || newValue < 0)
          {
            return;
          }

          qiDictionaries.settings.setWhQty(key, newValue);

          var diff = newValue - oldValue;
          var attrs = view.model.attributes;

          attrs.total.wh.all += diff;
          attrs.total.wh.ratio = (100 - (attrs.total.wh.nok / attrs.total.wh.all)) || 0;

          attrs.groups[i].wh.all = newValue;
          attrs.groups[i].wh.ratio = (100 - (attrs.groups[i].wh.nok / attrs.groups[i].wh.all)) || 0;

          view.model.trigger('change:groups');
        }
      }

    },

    initialize: function()
    {
      this.isLoading = false;
      this.selectedKey = null;
      this.lastColumns = [];

      this.listenTo(this.model, 'request', this.onModelLoading);
      this.listenTo(this.model, 'sync', this.onModelLoaded);
      this.listenTo(this.model, 'error', this.onModelError);
      this.listenTo(this.model, 'change:groups', this.render);
    },

    getTemplateData: function()
    {
      var model = this.model;
      var divisions = model.get('divisions');
      var columns = [];

      divisions.forEach(function(division)
      {
        if (division.type === 'prod')
        {
          columns.push({
            _id: division._id,
            label: division._id
          });
        }
      });

      columns.push(
        {_id: 'prod', label: t('qiResults', 'report:series:prod')},
        {_id: 'wh', label: t('qiResults', 'report:series:wh')}
      );

      this.lastColumns = columns;

      return {
        renderOkRatioTotalsTable: renderOkRatioTotalsTable,
        columns: columns,
        rows: model.get('groups'),
        okRatioRef: qiDictionaries.settings.getOkRatioRef(),
        canManage: user.isAllowedTo('QI:DICTIONARIES:MANAGE'),
        total: model.get('total')
      };
    },

    afterRender: function()
    {
      if (this.selectedKey)
      {
        var $tr = this.$('tr[data-key="' + this.selectedKey + '"]');

        this.selectedKey = null;

        if ($tr.length)
        {
          $tr.find('.is-clickable[data-property="month"]').click();
        }
      }
    },

    renderTotals: function(group)
    {
      this.$id('totals').html(this.renderPartialHtml(renderOkRatioTotalsTable, {
        columns: this.lastColumns,
        total: group
      }));
    },

    onModelLoading: function()
    {
      this.isLoading = true;
    },

    onModelLoaded: function()
    {
      this.isLoading = false;
    },

    onModelError: function()
    {
      this.isLoading = false;
    }

  });
});
