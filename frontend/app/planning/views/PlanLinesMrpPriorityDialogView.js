// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/orgUnits',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/linesMrpPriorityDialog'
], function(
  _,
  $,
  t,
  user,
  viewport,
  View,
  orgUnits,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    modelProperty: 'plan',

    template: template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'change #-line': function(e)
      {
        this.removeEmptyLines();
        this.addLine(e.added.id);
        this.$id('line').select2('val', '');
        this.toggleSubmit();
      },

      'change input[data-line-id]': function()
      {
        this.toggleSubmit();
      }

    },

    initialize: function()
    {
      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
    },

    afterRender: function()
    {
      this.setUpLineSelect2();

      this.mrp.lines.forEach(function(mrpLine) { this.addLine(mrpLine.id); }, this);

      this.toggleSubmit();
    },

    toggleSubmit: function()
    {
      var hasAnyMrp = false;

      this.$('input[data-line-id]').each(function()
      {
        hasAnyMrp = hasAnyMrp || this.value.length;
      });

      this.$id('submit').prop('disabled', !hasAnyMrp);
    },

    setUpLineSelect2: function()
    {
      var view = this;
      var maxLineLength = 0;
      var lines = orgUnits.getAllByType('prodLine')
        .filter(function(prodLine) { return !prodLine.get('deactivatedAt'); })
        .map(function(prodLine)
        {
          if (prodLine.id.length > maxLineLength)
          {
            maxLineLength = prodLine.id.length;
          }

          var disabled = view.plan.settings.isLineLocked(prodLine.id);

          return {
            id: prodLine.id,
            text: prodLine.get('description'),
            disabled: disabled,
            locked: disabled
          };
        })
        .sort(function(a, b) { return a.id.localeCompare(b.id, undefined, {numeric: true}); });

      view.$id('line').select2({
        allowClear: true,
        data: lines,
        matcher: function(term, text, item)
        {
          term = term.toUpperCase();

          return item.id.toUpperCase().indexOf(term) >= 0
            || item.text.toUpperCase().indexOf(term) >= 0;
        },
        formatSelection: function(item)
        {
          return _.escape(item.id) + ': ' + _.escape(item.text);
        },
        formatResult: function(item)
        {
          var id = item.id;

          while (id.length < maxLineLength)
          {
            id += ' ';
          }

          var icon = '';

          if (item.disabled)
          {
            icon = '<i class="fa fa-lock" style="color: #e00"></i> ';
          }

          return '<span class="text-mono">' + _.escape(id).replace(/ /g, '&nbsp;') + '</span>: '
            + '<span class="text-small">' + icon + _.escape(item.text) + '</span>';
        }
      });
    },

    removeEmptyLines: function()
    {
      this.$('input[data-line-id]').each(function()
      {
        if (this.value === '')
        {
          $(this).select2('destroy').parent().remove();
        }
      });
    },

    addLine: function(lineId)
    {
      var view = this;

      if (view.$id(lineId).select2('focus').length)
      {
        return;
      }

      var lineSettings = view.plan.settings.lines.get(lineId);
      var mrpPriority = lineSettings ? lineSettings.get('mrpPriority').concat([]) : [];

      if (!_.includes(mrpPriority, view.mrp.id))
      {
        mrpPriority.push(view.mrp.id);
      }

      var id = view.idPrefix + '-' + lineId;
      var $group = $('<div class="form-group"></div>');
      var $label = $('<label></label>').attr('for', id).text(lineId);
      var $input = $('<input type="text" autocomplete="new-password">')
        .attr('id', id)
        .attr('data-line-id', lineId)
        .val(mrpPriority.join(','));

      $group.append($label).append($input).appendTo(view.$id('lines'));

      view.setUpMrpPriority($input, true);
    },

    setUpMrpPriority: function($input, focus)
    {
      var view = this;
      var lineId = $input.attr('data-line-id');

      setUpMrpSelect2($input, {
        view: view,
        sortable: true,
        width: '100%',
        placeholder: view.t('settings:mrpPriority:placeholder'),
        itemDecorator: function(item)
        {
          item.disabled = view.plan.settings.isMrpLocked(item.id);
          item.locked = item.disabled;

          if (item.locked)
          {
            item.icon = {id: 'fa-lock', color: '#e00'};
          }

          return item;
        }
      });

      if (view.plan.settings.isLineLocked(lineId))
      {
        $input.select2('readonly', true);
      }
      else if (focus)
      {
        $input.select2('focus');
      }
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');
      var settings = view.plan.settings;

      view.$('input[data-line-id]').each(function()
      {
        var lineId = this.dataset.lineId;
        var lineSettings = settings.lines.get(lineId);
        var mrpPriority = this.value.length ? this.value.split(',') : [];

        if (lineSettings)
        {
          lineSettings.set('mrpPriority', mrpPriority);
        }
        else if (mrpPriority.length)
        {
          settings.lines.add({
            _id: lineId,
            mrpPriority: mrpPriority
          });
        }
      });

      var req = settings.save();

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('lines:menu:mrpPriority:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    },

    onSettingsChanged: function(changes)
    {
      if (!changes.locked)
      {
        return;
      }

      var view = this;

      view.setUpLineSelect2();

      view.$('input[data-line-id]').each(function()
      {
        var $mrpPriority = view.$(this);
        var lineSettings = view.plan.settings.lines.get(this.dataset.lineId);
        var oldMrpPriority = lineSettings.get('mrpPriority');
        var newMrpPriority = $mrpPriority
          .val()
          .split(',')
          .filter(function(mrp)
          {
            return mrp.length > 0 && (_.includes(oldMrpPriority, mrp) || !view.plan.settings.isMrpLocked(mrp));
          });

        $mrpPriority.select('destroy').val(newMrpPriority.join(','));

        view.setUpMrpPriority($mrpPriority, false);
      });
    }

  });
});
