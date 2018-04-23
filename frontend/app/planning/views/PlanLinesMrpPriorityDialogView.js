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

          return {
            id: prodLine.id,
            text: _.escape(prodLine.get('description'))
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
          return _.escape(item.id + ': ' + item.text);
        },
        formatResult: function(item)
        {
          var id = item.id;

          while (id.length < maxLineLength)
          {
            id += ' ';
          }

          return '<span class="text-mono">' + id.replace(/ /g, '&nbsp;') + '</span>: ' + item.text;
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
      if (this.$id(lineId).select2('focus').length)
      {
        return;
      }

      var lineSettings = this.plan.settings.lines.get(lineId);
      var mrpPriority = lineSettings ? lineSettings.get('mrpPriority') : [];

      if (!_.includes(mrpPriority, this.mrp.id))
      {
        mrpPriority.push(this.mrp.id);
      }

      var id = this.idPrefix + '-' + lineId;
      var $group = $('<div class="form-group"></div>');
      var $label = $('<label></label>').attr('for', id).text(lineId);
      var $input = $('<input type="text">').attr('id', id).attr('data-line-id', lineId).val(mrpPriority.join(','));

      $group.append($label).append($input).appendTo(this.$id('lines'));

      setUpMrpSelect2($input, {
        view: this,
        sortable: true,
        width: '100%',
        placeholder: t('planning', 'settings:mrpPriority:placeholder')
      });

      $input.select2('focus');
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
          text: t('planning', 'lines:menu:mrpPriority:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('line').select2('focus');
    }

  });
});
