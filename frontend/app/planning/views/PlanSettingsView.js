// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'Sortable',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/data/orgUnits',
  'app/data/orderStatuses',
  'app/core/views/FormView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/planSettings'
], function(
  _,
  $,
  Sortable,
  t,
  time,
  user,
  viewport,
  orgUnits,
  orderStatuses,
  FormView,
  setUpMrpSelect2,
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
        var settings = this.model;
        var o = settings;
        var v;

        if (object === 'line')
        {
          o = o.lines.get(this.$id('line').val());
        }
        else if (object !== 'plan')
        {
          o = o.mrps.get(this.$id('mrp').val());

          if (object === 'mrpLine')
          {
            o = o.lines.get(this.$id('mrpLine').val());
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
          case 'splitOrderQuantity':
          case 'maxSplitLineCount':
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
            v = this.parseActiveTime($property);
            break;
        }

        if (v !== undefined)
        {
          o.attributes[property] = v;
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

        var mrp = this.model.mrps.get(selectedMrp);

        if (mrp)
        {
          if (!mrp.lines.get(selectedLine))
          {
            selectedLine = _.result(mrp.lines.first(), 'id');
          }
        }
        else
        {
          selectedLine = _.result(
            this.model.lines.find(function(line) { return _.includes(line.get('mrpPriority'), selectedMrp); }),
            'id'
          );
        }

        this.selectMrp(selectedMrp, selectedLine || null);
      },

      'change #-mrpLine': function(e)
      {
        var mrp = this.model.mrps.get(this.$id('mrp').val());

        this.selectMrpLine(mrp, e.added ? e.added.id : null, false);
      }

    }, FormView.prototype.events),

    remoteTopics: {

      'planning.generator.finished': function(message)
      {
        if (message.date === this.model.id)
        {
          this.onGeneratorFinished();
        }
      },
      'planning.settings.updated': function(message)
      {
        if (message.date === this.model.id)
        {
          if (message.changes.length === 0)
          {
            this.onGeneratorFinished();
          }
          else
          {
            this.model.applyChanges(message.changes);
          }
        }
      }

    },

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.sortables = [];

      this.stopListening(this.model, 'change');

      this.listenTo(this.model, 'change', _.after(2, this.onSettingChange.bind(this)));
      this.listenTo(this.model, 'changed', this.onSettingsChanged);
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

      if (!this.model.isEditable())
      {
        this.$id('submit').prop('disabled', true);
      }
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
      this.$id('hardComponents').select2({
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
    },

    setUpLine: function()
    {
      var view = this;
      var $line = view.$id('line');
      var $mrpPriority = view.$id('mrpPriority');
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

      setUpMrpSelect2($mrpPriority, {
        width: '100%',
        placeholder: t('planning', 'settings:mrpPriority:placeholder')
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

      $line.on('change', function(e, added)
      {
        if (added === undefined)
        {
          added = e.added;
        }

        view.selectLine(added ? added.id : null);
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

      this.model.lines.forEach(function(line)
      {
        line.get('mrpPriority').forEach(function(mrpId)
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

      this.model.lines.forEach(function(line)
      {
        if (mrp && _.includes(line.get('mrpPriority'), mrp.id))
        {
          lines[line.id] = 1;

          if (line.id.length > maxLineLength)
          {
            maxLineLength = line.id.length;
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

    selectLine: function(lineId)
    {
      var view = this;
      var disabled = !lineId;
      var activeFrom = '';
      var activeTo = '';
      var $mrpPriority = view.$id('mrpPriority');

      if (!disabled)
      {
        var selectedLine = lineId;
        var line = view.model.lines.get(selectedLine);

        if (!line)
        {
          line = view.model.lines.add({_id: selectedLine}).get(selectedLine);
        }

        var lineMrpPriority = line ? line.get('mrpPriority') : [];

        $mrpPriority
          .select2('enable', true)
          .select2('data', lineMrpPriority.map(function(mrp)
          {
            return {
              id: mrp,
              text: mrp
            };
          }));

        var selectedMrp = view.$id('mrp').select2('data');

        if (line.get('mrpPriority').length)
        {
          var mrpPriority = line.get('mrpPriority');

          selectedMrp = selectedMrp && _.includes(mrpPriority, selectedMrp.id)
            ? selectedMrp.id
            : mrpPriority[0];
          activeFrom = line.get('activeFrom');
          activeTo = line.get('activeTo');
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
    },

    selectMrp: function(mrpId, lineId)
    {
      var view = this;

      view.$id('mrp').select2('val', mrpId || '');

      var mrps = view.model.mrps;
      var mrp = mrps.get(mrpId);
      var enabled = !!view.$id('mrp').select2('data');
      var disabled = !enabled;

      if (enabled && !mrp)
      {
        mrp = mrps.add({_id: mrpId}).get(mrpId);
      }

      (mrp ? mrp.get('extraShiftSeconds') : [0, 0, 0]).forEach(function(v, i)
      {
        view.$id('extraShiftSeconds-' + (i + 1))
          .val(disabled ? '' : v)
          .prop('disabled', disabled);
      });

      [
        'extraOrderSeconds',
        'bigOrderQuantity',
        'hardOrderManHours',
        'splitOrderQuantity',
        'maxSplitLineCount'
      ].forEach(function(prop)
      {
        view.$id(prop)
          .val(disabled ? '' : mrp.get(prop))
          .prop('disabled', disabled);
      });

      view.$id('hardComponents')
        .select2('data', disabled ? [] : (mrp.get('hardComponents') || []).map(function(nc12)
        {
          return {id: nc12, text: nc12};
        }))
        .select2('enable', enabled);

      view.setUpMrpLineSelect2();
      view.selectMrpLine(mrp, lineId, disabled);
    },

    selectMrpLine: function(mrp, lineId, disabled)
    {
      var view = this;
      var line = mrp ? mrp.lines.get(lineId) : null;

      view.$id('mrpLine').select2('val', lineId || '').select2('enable', !disabled);

      disabled = disabled || !view.$id('mrpLine').select2('data');

      if (!disabled && !line)
      {
        line = mrp.lines.add({_id: lineId}).get(lineId);
      }

      view.$id('workerCount')
        .val(disabled ? '' : line.get('workerCount'))
        .prop('disabled', disabled);

      view.$id('orderPriority')
        .select2('val', disabled ? [] : line.get('orderPriority'))
        .prop('disabled', disabled);
    },

    saveMrpPriority: function()
    {
      var selectedLine = this.$id('line').val();
      var mrpPriority = this.$id('mrpPriority').val().split(',').filter(function(mrpId) { return mrpId.length; });
      var lines = this.model.lines;
      var line = lines.get(selectedLine);

      if (line)
      {
        line.set('mrpPriority', mrpPriority);
      }
      else
      {
        lines.add({
          _id: selectedLine,
          mrpPriority: mrpPriority,
          activeFrom: this.parseActiveTime(this.$id('activeFrom')),
          activeTo: this.parseActiveTime(this.$id('activeTo'))
        });
      }

      this.setUpMrpSelect2();
    },

    saveOrderPriority: function()
    {
      var mrp = this.model.mrps.get(this.$id('mrp').val());
      var mrpLine = mrp.lines.get(this.$id('mrpLine').val());

      mrpLine.set('orderPriority', _.pluck(this.$id('orderPriority').select2('data'), 'id'));
    },

    parseActiveTime: function($property)
    {
      var parts = $property.val().split(':');
      var hh = +parts[0];
      var mm = +parts[1];

      if (hh >= 0 && hh <= 24 && mm >= 0 && mm <= 59)
      {
        if (hh === 24)
        {
          hh = 0;
        }

        return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
      }

      return '';
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.requiredStatuses = formData.requiredStatuses.join(',');
      formData.ignoredStatuses = formData.ignoredStatuses.join(',');

      return formData;
    },

    serializeForm: function()
    {
      return {};
    },

    checkValidity: function()
    {
      return true;
    },

    submitRequest: function($submitEl, formData)
    {
      var req = this.request(formData);

      req.done(this.handleSuccess.bind(this));
      req.fail(this.handleFailure.bind(this));
    },

    handleSuccess: function()
    {
      this.timers.waitForGenerator = setTimeout(this.onGeneratorFinished.bind(this), 10000);

      viewport.msg.show({
        type: 'success',
        time: 2500,
        text: t('planning', 'settings:msg:success')
      });
    },

    handleFailure: function()
    {
      FormView.prototype.handleFailure.apply(this, arguments);

      this.$id('submit').prop('disabled', false);
    },

    getFailureText: function()
    {
      return t('planning', 'settings:msg:failure');
    },

    onGeneratorFinished: function()
    {
      if (!this.timers.waitForGenerator)
      {
        return;
      }

      clearTimeout(this.timers.waitForGenerator);
      this.timers.waitForGenerator = null;

      if (this.options.back)
      {
        this.broker.publish('router.navigate', {
          url: '/planning/plans/' + this.model.id,
          trigger: true,
          replace: false
        });
      }
      else
      {
        this.$id('submit').prop('disabled', false);
      }
    },

    onSettingChange: function()
    {
      var view = this;
      var changed = view.model.changed;

      Object.keys(changed).forEach(function(property)
      {
        var value = changed[property];

        switch (property)
        {
          case 'ignoreCompleted':
          case 'useRemainingQuantity':
            view.$id(property).prop('checked', !!value);
            break;

          case 'requiredStatuses':
          case 'ignoredStatuses':
            view.$id(property).select2('val', value);
            break;
        }
      });
    },

    onSettingsChanged: function(changed)
    {
      var activeEl = document.activeElement;
      var selectedLine = this.$id('line').val();
      var selectedMrp = this.$id('mrp').val();
      var selectedMrpLine = this.$id('mrpLine').val();

      if (changed.lines[selectedLine])
      {
        this.$id('line').select2('val', selectedLine).trigger('change', {id: selectedLine});
      }

      if (changed.mrps[selectedMrp])
      {
        this.selectMrp(selectedMrp, selectedMrpLine);
      }

      if (activeEl)
      {
        activeEl.focus();
      }
    }

  });
});
