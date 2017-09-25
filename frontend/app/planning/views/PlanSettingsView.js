// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/time',
  'app/user',
  'app/data/orgUnits',
  'app/data/orderStatuses',
  'app/core/views/FormView',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/planSettings'
], function(
  _,
  $,
  Sortable,
  t,
  time,
  user,
  orgUnits,
  orderStatuses,
  FormView,
  renderOrderStatusLabel,
  template
) {
  'use strict';

  function idAndTextMatcher(term, text, item)
  {
    term = term.toUpperCase();

    return item.id.toUpperCase().indexOf(term) >= 0
      || item.text.toUpperCase().indexOf(term) >= 0;
  }

  return FormView.extend({

    template: template,

    events: _.extend({

      'change [data-object]': function(e)
      {
        var object = e.currentTarget.dataset.object;
        var property = e.currentTarget.name;
        var o = this.model.attributes;
        var v;

        if (object === 'line')
        {
          o = _.findWhere(o.lines, {_id: this.$id('line').val()});
        }
        else if (object !== 'plan')
        {
          o = _.findWhere(o.mrps, {_id: this.$id('mrp').val()});

          if (object === 'mrpLine')
          {
            o = _.findWhere(o.lines, {_id: this.$id('mrpLine').val()});
          }
        }

        var $property = this.$id(property);

        switch (property)
        {
          case 'requiredStatuses':
          case 'ignoredStatuses':
          case 'hardComponents':
          case 'orderPriority':
            v = $property.val().split(',').filter(function(v) { return v.length > 0; });
            break;

          case 'ignoreCompleted':
          case 'useRemainingQuantity':
            v = $property.prop('checked');
            break;

          case 'extraOrderSeconds':
          case 'bigOrderQuantity':
          case 'workerCount':
            v = Math.max(0, parseInt($property.val(), 10) || 0);
            break;

          case 'extraShiftSeconds':
            v = [
              Math.max(0, parseInt(this.$id(property + '-1').val(), 10) || 0),
              Math.max(0, parseInt(this.$id(property + '-2').val(), 10) || 0),
              Math.max(0, parseInt(this.$id(property + '-3').val(), 10) || 0)
            ];
            break;

          case 'hardOrderManHours':
            v = Math.max(0, parseFloat($property.val()) || 0);
            break;

          case 'activeFrom':
          case 'activeTo':
            var parts = $property.val().split(':');
            var hh = +parts[0];
            var mm = +parts[1];

            if (hh >= 0 && hh <= 24 && mm >= 0 && mm <= 59)
            {
              if (hh === 24)
              {
                hh = 0;
              }

              v = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
            }
            else
            {
              v = '';
            }
            break;
        }

        if (v !== undefined)
        {
          o[property] = v;
        }
      },

      'change #-mrp': function(e)
      {
        var selectedMrp = e.added ? e.added.id : null;
        var selectedLine = _.result(this.$id('mrpLine').select2('data'), 'id');

        if (!selectedLine)
        {
          selectedLine = _.result(this.$id('line').select2('data'), 'id');
        }

        var mrp = _.findWhere(this.model.get('mrps'), {_id: selectedMrp});

        if (mrp)
        {
          if (!_.findWhere(mrp.lines, {_id: selectedLine}))
          {
            selectedLine = _.result(mrp.lines[0], '_id');
          }
        }
        else
        {
          selectedLine = _.result(
            _.find(
              this.model.get('lines'),
              function(line) { return line.mrpPriority.indexOf(selectedMrp) >= 0; }
            ),
            '_id'
          );
        }

        this.selectMrp(selectedMrp, selectedLine || null);
      },

      'change #-mrpLine': function(e)
      {
        var mrp = _.findWhere(this.model.get('mrps'), {_id: this.$id('mrp').val()});

        this.selectMrpLine(mrp, e.added ? e.added.id : null, false);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.sortables = [];

      this.stopListening(this.model, 'change');
    },

    destroy: function()
    {
      this.destroySortables();
    },

    destroySortables: function()
    {
      for (var i = 0, l = this.sortables.length; i < l; ++i)
      {
        this.sortables[i].destroy();
      }

      this.sortables = [];
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {

      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpOrderStatusSelect2('requiredStatuses');
      this.setUpOrderStatusSelect2('ignoredStatuses');
      this.setUpHardComponentsSelect2();
      this.setUpLine();
      this.setUpMrpSelect2();
      this.setUpMrpLineSelect2();
      this.setUpOrderPrioritySelect2();
      this.selectMrp(null);
    },

    setUpOrderStatusSelect2: function(id)
    {
      this.$id(id).select2({
        allowClear: true,
        multiple: true,
        data: orderStatuses.map(function(status)
        {
          return {
            id: status.id,
            text: status.get('label')
          };
        }),
        matcher: idAndTextMatcher,
        formatSelection: function(item)
        {
          return item.id;
        },
        formatResult: function(item)
        {
          return renderOrderStatusLabel(item.id) + ' ' + _.escape(item.text);
        }
      });
    },

    setUpHardComponentsSelect2: function()
    {
      var $input = this.$id('hardComponents').select2({
        placeholder: '12NC...',
        allowClear: true,
        multiple: true,
        data: [],
        formatNoMatches: null,
        minimumResultsForSearch: 1,
        dropdownCssClass: 'hidden',
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/([0-9]{12}|[A-Z]{3}[A-Z0-9]{4})/ig) || []).forEach(function(nc12)
          {
            result = result.replace(nc12, '');

            nc12 = nc12.toUpperCase();

            if (!options[nc12])
            {
              selectCallback({id: nc12, text: nc12});
              options[nc12] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      $input.select2(
        'data',
        $input
          .val()
          .split(',')
          .filter(function(nc12) { return !!nc12.length; })
          .map(function(nc12) { return {id: nc12, text: nc12}; })
      );
    },

    setUpLine: function()
    {
      var view = this;
      var $line = view.$id('line');
      var $mrpPriority = view.$id('mrpPriority');
      var maxLineLength = 0;
      var maxMrpLength = 0;
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
      var mrps = orgUnits.getAllByType('mrpController')
        .filter(function(mrp) { return mrp.id.indexOf('~') === -1; })
        .map(function(mrp)
        {
          if (mrp.id.length > maxMrpLength)
          {
            maxMrpLength = mrp.id.length;
          }

          return {
            id: mrp.id,
            text: _.escape(mrp.get('description'))
          };
        })
        .sort(function(a, b) { return a.id.localeCompare(b.id, undefined, {numeric: true}); });

      $line.select2({
        placeholder: t('planning', 'settings:line:placeholder'),
        allowClear: true,
        data: lines,
        matcher: idAndTextMatcher,
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

      $mrpPriority.select2({
        placeholder: t('planning', 'settings:mrpPriority:placeholder'),
        allowClear: true,
        multiple: true,
        data: mrps,
        matcher: idAndTextMatcher,
        formatSelection: function(item)
        {
          return _.escape(item.id);
        },
        formatResult: function(item)
        {
          var id = item.id;

          while (id.length < maxMrpLength)
          {
            id += ' ';
          }

          return '<span class="text-mono">' + id.replace(/ /g, '&nbsp;') + '</span>: ' + item.text;
        },
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/([A-Z]{2}[0-9]+)/ig) || []).forEach(function(mrp)
          {
            result = result.replace(mrp, '');

            mrp = mrp.toUpperCase();

            if (!options[mrp])
            {
              selectCallback({id: mrp, text: mrp});
              options[mrp] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      var choicesEl = $mrpPriority.select2('container').find('.select2-choices')[0];

      this.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $mrpPriority.select2('onSortStart');
        },
        onEnd: function(e)
        {
          $mrpPriority.select2('onSortEnd').select2('focus');

          view.saveMrpPriority();
          view.selectMrp($(e.target).data('select2-data').id, $line.val() || null);
        }
      }));

      $line.on('change', function(e)
      {
        var lines = view.model.get('lines');
        var disabled = !e.added;
        var activeFrom = '';
        var activeTo = '';

        if (!disabled)
        {
          var selectedLine = e.added.id;
          var line = _.findWhere(lines, {_id: selectedLine});

          $mrpPriority
            .select2('enable', true)
            .select2('val', line ? line.mrpPriority : []);

          var selectedMrp = view.$id('mrp').select2('data');

          if (line && line.mrpPriority.length)
          {
            selectedMrp = selectedMrp && line.mrpPriority.indexOf(selectedMrp.id) >= 0
              ? selectedMrp.id
              : line.mrpPriority[0];
            activeFrom = line.activeFrom;
            activeTo = line.activeTo;
          }
          else
          {
            selectedMrp = null;
            selectedLine = null;
          }

          view.selectMrp(selectedMrp, selectedLine);
        }
        else
        {
          $mrpPriority
            .select2('enable', false)
            .select2('val', '');

          view.selectMrp(null, null);
        }

        view.$id('activeFrom')
          .val(activeFrom)
          .prop('disabled', disabled);

        view.$id('activeTo')
          .val(activeTo)
          .prop('disabled', disabled);
      });

      $mrpPriority.on('change', function(e)
      {
        view.saveMrpPriority();

        if (e.added)
        {
          view.selectMrp(e.added.id, $line.val() || null);
        }
        else if (e.removed)
        {
          view.selectMrp(null);
        }
      });

      $mrpPriority.select2('enable', false);
      view.$id('activeFrom').prop('disabled', true);
      view.$id('activeTo').prop('disabled', true);
    },

    setUpMrpSelect2: function()
    {
      var maxMrpLength = 0;
      var mrps = {};

      this.model.get('lines').forEach(function(line)
      {
        line.mrpPriority.forEach(function(mrpId)
        {
          mrps[mrpId] = 1;

          if (mrpId.length > maxMrpLength)
          {
            maxMrpLength = mrpId.length;
          }
        });
      });

      this.$id('mrp').select2({
        placeholder: t('planning', 'settings:mrp:placeholder'),
        allowClear: true,
        data: Object.keys(mrps).map(function(mrpId)
        {
          var mrpModel = orgUnits.getByTypeAndId('mrpController', mrpId);

          return {
            id: mrpId,
            text: mrpModel ? mrpModel.get('description') : ''
          };
        }),
        matcher: idAndTextMatcher,
        formatSelection: function(item)
        {
          return _.escape(item.id + ': ' + item.text);
        },
        formatResult: function(item)
        {
          var id = item.id;

          while (id.length < maxMrpLength)
          {
            id += ' ';
          }

          return '<span class="text-mono">' + id.replace(/ /g, '&nbsp;') + '</span>: ' + item.text;
        }
      });
    },

    setUpMrpLineSelect2: function()
    {
      var mrp = this.$id('mrp').select2('data');
      var maxLineLength = 0;
      var lines = {};

      this.model.get('lines').forEach(function(line)
      {
        if (mrp && line.mrpPriority.indexOf(mrp.id) >= 0)
        {
          lines[line._id] = 1;

          if (line._id.length > maxLineLength)
          {
            maxLineLength = line._id.length;
          }
        }
      });

      var data = Object.keys(lines).map(function(lineId)
      {
        var lineModel = orgUnits.getByTypeAndId('prodLine', lineId);

        return {
          id: lineId,
          text: lineModel ? lineModel.get('description') : ''
        };
      });

      var $mrpLine = this.$id('mrpLine').select2({
        placeholder: t('planning', 'settings:mrpLine:placeholder'),
        allowClear: true,
        data: data,
        matcher: idAndTextMatcher,
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

      $mrpLine.select2('enable', data.length > 0);
    },

    setUpOrderPrioritySelect2: function()
    {
      var view = this;
      var $orderPriority = view.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        data: [
          {id: 'small', text: t('planning', 'orderPriority:small')},
          {id: 'easy', text: t('planning', 'orderPriority:easy')},
          {id: 'hard', text: t('planning', 'orderPriority:hard')}
        ]
      });

      var choicesEl = $orderPriority.select2('container').find('.select2-choices')[0];

      view.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $orderPriority.select2('onSortStart');
        },
        onEnd: function()
        {
          $orderPriority.select2('onSortEnd').select2('focus');

          view.saveOrderPriority();
        }
      }));

      $orderPriority.on('change', function()
      {
        view.saveOrderPriority();
      });
    },

    selectMrp: function(mrpId, lineId)
    {
      var view = this;

      view.$id('mrp').select2('val', mrpId || '');

      var mrps = view.model.get('mrps');
      var mrp = _.findWhere(mrps, {_id: mrpId});
      var enabled = !!view.$id('mrp').select2('data');
      var disabled = !enabled;

      if (!mrp)
      {
        mrp = {
          _id: mrpId,
          extraOrderSeconds: 0,
          extraShiftSeconds: [0, 0, 0],
          bigOrderQuantity: 0,
          hardOrderManHours: 0,
          lines: []
        };

        if (enabled)
        {
          mrps.push(mrp);
        }
      }

      view.$id('extraOrderSeconds')
        .val(disabled ? '' : mrp.extraOrderSeconds)
        .prop('disabled', disabled);

      mrp.extraShiftSeconds.forEach(function(v, i)
      {
        view.$id('extraShiftSeconds-' + (i + 1))
          .val(disabled ? '' : v)
          .prop('disabled', disabled);
      });

      view.$id('bigOrderQuantity')
        .val(disabled ? '' : mrp.bigOrderQuantity)
        .prop('disabled', disabled);

      view.$id('hardOrderManHours')
        .val(disabled ? '' : mrp.hardOrderManHours)
        .prop('disabled', disabled);

      view.setUpMrpLineSelect2();
      view.selectMrpLine(mrp, lineId, disabled);
    },

    selectMrpLine: function(mrp, lineId, disabled)
    {
      var view = this;

      view.$id('mrpLine').select2('val', lineId || '').select2('enable', !disabled);

      var line = _.findWhere(mrp.lines, {_id: lineId});

      disabled = disabled || !view.$id('mrpLine').select2('data');

      if (!line)
      {
        line = {
          _id: lineId,
          workerCount: 1,
          orderPriority: ['small', 'easy', 'hard']
        };

        if (!disabled)
        {
          mrp.lines.push(line);
        }
      }

      view.$id('workerCount')
        .val(disabled ? '' : line.workerCount)
        .prop('disabled', disabled);

      view.$id('orderPriority')
        .select2('val', disabled ? [] : line.orderPriority)
        .prop('disabled', disabled);
    },

    saveMrpPriority: function()
    {
      var selectedLine = this.$id('line').val();
      var mrpPriority = this.$id('mrpPriority').val();
      var lines = this.model.get('lines');
      var line = _.findWhere(lines, {_id: selectedLine});

      if (mrpPriority.length)
      {
        if (line)
        {
          line.mrpPriority = mrpPriority.split(',');
        }
        else
        {
          lines.push({
            _id: selectedLine,
            mrpPriority: mrpPriority.split(','),
            activeFrom: '',
            activeTo: ''
          });
        }
      }
      else if (line)
      {
        this.model.set(
          'lines',
          lines.filter(function(line) { return line._id !== line; }),
          {silent: true}
        );
      }

      this.setUpMrpSelect2();
    },

    saveOrderPriority: function()
    {
      var mrp = _.findWhere(this.model.get('mrps'), {_id: this.$id('mrp').val()});
      var mrpLine = _.findWhere(mrp.lines, {_id: this.$id('mrpLine').val()});

      mrpLine.orderPriority = _.pluck(this.$id('orderPriority').select2('data'), 'id');
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.requiredStatuses = formData.requiredStatuses.join(',');
      formData.ignoredStatuses = formData.ignoredStatuses.join(',');
      formData.lines = undefined;
      formData.mrps = undefined;

      return formData;
    },

    serializeForm: function()
    {
      return {};
    },

    checkValidity: function()
    {
      return true;
    }

  });
});
