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
  'app/core/util/decimalSeparator',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/planSettings',
  'app/planning/templates/planSettingsGroup'
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
  decimalSeparator,
  setUpMrpSelect2,
  renderOrderStatusLabel,
  template,
  groupTemplate
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

    events: _.assign({

      'change [data-object]': function(e)
      {
        var object = e.currentTarget.dataset.object;
        var property = e.currentTarget.name;
        var index = e.currentTarget.dataset.index >= 0 ? +e.currentTarget.dataset.index : undefined;

        this.updateProperty(object, property, index);
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
      },

      'blur #-schedulingRate': function(e)
      {
        e.target.value = this.formatSchedulingRate(this.model.get('schedulingRate'));
      },

      'blur #-ignoredWorkCenters': function(e)
      {
        e.target.value = this.formatIgnoredWorkCenters(this.model.get('ignoredWorkCenters'));
      },

      'click #-addGroup': function()
      {
        this.addGroup({
          splitOrderQuantity: 0,
          lines: [],
          components: []
        });
      },

      'click .btn[name="removeGroup"]': function(e)
      {
        var view = this;
        var $group = view.$(e.currentTarget).closest('tr');

        $group.fadeOut('fast', function()
        {
          $group.find('[name="group.lines"]').select2('destroy');
          $group.find('[name="group.components"]').select2('destroy');
          $group.remove();

          view.updateProperty('mrp', 'group');
        });
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
      this.maxLineLength = 0;
      this.lines = [];

      this.stopListening(this.model, 'change');

      this.once('afterRender', () =>
      {
        this.listenTo(this.model, 'change', this.onSettingChange);
        this.listenTo(this.model, 'changed', this.onSettingsChanged);
      });
    },

    destroy: function()
    {
      for (var i = 0, l = this.sortables.length; i < l; ++i)
      {
        this.sortables[i].destroy();
      }

      this.sortables = [];
    },

    getTemplateData: function()
    {
      return {
        version: this.model.getVersion()
      };
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.cacheLines();
      this.setUpHelpPopovers();
      this.setUpOrderStatusSelect2('requiredStatuses');
      this.setUpOrderStatusSelect2('ignoredStatuses');
      this.setUpOrderStatusSelect2('completedStatuses');
      this.setUpComponentsSelect2(this.$id('hardComponents'));
      this.setUpComponentsSelect2(this.$id('hardBigComponents'));
      this.setUpLineSelect2();
      this.setUpMrpSelect2();
      this.setUpMrpLineSelect2();
      this.setUpLinePrioritySelect2();
      this.setUpOrderPrioritySelect2();
      this.selectMrp(null);

      if (!this.model.isEditable())
      {
        this.$id('submit').prop('disabled', true);
      }
    },

    setUpHelpPopovers: function()
    {
      const view = this;

      view.$('label[data-help]').popover({
        trigger: 'hover',
        className: 'planning-settings-helpPopover',
        html: true,
        content: function()
        {
          const key = `settings:${this.dataset.help || this.control.name}:help`;

          if (view.t.has(key))
          {
            return view.t(key);
          }

          return '';
        }
      });
    },

    cacheLines: function()
    {
      this.lines = orgUnits.getAllByType('prodLine')
        .filter(prodLine => !prodLine.get('deactivatedAt'))
        .map(prodLine =>
        {
          if (prodLine.id.length > this.maxLineLength)
          {
            this.maxLineLength = prodLine.id.length;
          }

          return {
            id: prodLine.id,
            text: _.escape(prodLine.get('description')),
            disabled: this.model.isLineLocked(prodLine.id)
          };
        })
        .sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true, ignorePunctuation: true}));
    },

    setUpOrderStatusSelect2: function(id)
    {
      this.$id(id).select2({
        allowClear: true,
        multiple: true,
        data: orderStatuses.map(status =>
        {
          return {
            id: status.id,
            text: status.get('label')
          };
        }),
        matcher: idAndTextMatcher,
        formatSelection: item => item.id,
        formatResult: item => `${renderOrderStatusLabel(item.id)} ${_.escape(item.text)}`
      });
    },

    setUpComponentsSelect2: function($input)
    {
      if (!$input.length)
      {
        return;
      }

      $input.select2({
        width: '100%',
        placeholder: '12NC...',
        allowClear: true,
        multiple: true,
        data: [],
        formatNoMatches: null,
        minimumResultsForSearch: 1,
        dropdownCssClass: 'hidden',
        tokenizer: (input, selection, selectCallback) =>
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

    setUpLineSelect2: function()
    {
      var view = this;
      var $line = view.$id('line');

      $line.select2({
        width: '100%',
        placeholder: view.t('settings:line:placeholder'),
        allowClear: true,
        data: this.lines,
        matcher: idAndTextMatcher,
        formatSelection: function(item)
        {
          return _.escape(item.id + ': ' + item.text);
        },
        formatResult: function(item)
        {
          var id = item.id;

          while (id.length < view.maxLineLength)
          {
            id += ' ';
          }

          return '<span class="text-mono">' + id.replace(/ /g, '&nbsp;') + '</span>: ' + item.text;
        }
      });

      $line.on('change', function(e, added)
      {
        if (added === undefined)
        {
          added = e.added;
        }

        view.selectLine(added ? added.id : null);
      });

      view.$id('activeTime').prop('disabled', true);
      view.$id('extraCapacity').prop('disabled', true);

      if (view.model.getVersion() > 1)
      {
        view.$('input[name="workerCount"]').prop('disabled', true);
      }

      view.setUpMrpPriority();
      view.setUpOrderGroupPriority();
    },

    setUpMrpPriority: function()
    {
      var view = this;
      var $priority = view.$id('mrpPriority');

      setUpMrpSelect2($priority, {
        width: '100%',
        placeholder: view.t('settings:mrpPriority:placeholder')
      });

      var choicesEl = $priority.select2('container').find('.select2-choices')[0];

      view.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $priority.select2('onSortStart');
        },
        onEnd: function(e)
        {
          $priority.select2('onSortEnd').select2('focus');

          view.saveMrpPriority();
          view.selectMrp($(e.target).data('select2-data').id, view.$id('line').val() || null);
        }
      }));

      $priority.on('change', function(e)
      {
        view.saveMrpPriority();

        if (e.added)
        {
          view.selectMrp(e.added.id, view.$id('line').val() || null);
        }
        else if (e.removed)
        {
          view.selectMrp(null);
        }
      });

      $priority.select2('enable', false);
    },

    setUpOrderGroupPriority: function()
    {
      var view = this;
      var $priority = view.$id('orderGroupPriority');

      if (!$priority.length)
      {
        return;
      }

      $priority.select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        placeholder: view.t('settings:orderGroupPriority:placeholder'),
        data: this.orderGroups.map(function(group)
        {
          return {
            id: group.id,
            text: group.getLabel()
          };
        })
      });

      var choicesEl = $priority.select2('container').find('.select2-choices')[0];

      view.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: function()
        {
          $priority.select2('onSortStart');
        },
        onEnd: function()
        {
          $priority.select2('onSortEnd').select2('focus');

          view.saveOrderGroupPriority();
        }
      }));

      $priority.on('change', function()
      {
        view.saveOrderGroupPriority();
      });

      $priority.select2('enable', false);
    },

    setUpMrpSelect2: function()
    {
      var view = this;
      var maxMrpLength = 0;
      var mrps = {};

      view.model.lines.forEach(function(line)
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

      view.$id('mrp').select2({
        width: '100%',
        placeholder: view.t('settings:mrp:placeholder'),
        allowClear: true,
        data: Object.keys(mrps).map(function(mrpId)
        {
          var mrpModel = orgUnits.getByTypeAndId('mrpController', mrpId);

          return {
            id: mrpId,
            text: mrpModel ? mrpModel.get('description') : '',
            disabled: view.model.isMrpLocked(mrpId)
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
        width: '100%',
        placeholder: this.t('settings:mrpLine:placeholder'),
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

    setUpLinePrioritySelect2: function()
    {
      var $linePriority = this.$id('linePriority');

      if (!$linePriority.length)
      {
        return;
      }

      var data = [];
      var selectedMrp = this.$id('mrp').val();

      if (selectedMrp)
      {
        var mrpSettings = this.model.mrps.get(selectedMrp);
        var lines = [].concat(mrpSettings.get('linePriority') || []);

        this.model.lines.forEach(lineSettings =>
        {
          if (!lines.includes(lineSettings.id)
            && lineSettings.get('mrpPriority').includes(selectedMrp))
          {
            lines.push(lineSettings.id);
          }
        });

        lines.forEach(line =>
        {
          data.push({
            id: line,
            text: line,
            locked: true
          });
        });
      }

      $linePriority.select2({
        allowClear: false,
        multiple: true,
        dropdownCssClass: 'hidden',
        data: data.concat([]).sort((a, b) => a.id.localeCompare(b.id, undefined, {
          numeric: true,
          ignorePunctuation: true
        }))
      });

      if ($linePriority.data('sortable'))
      {
        $linePriority.data('sortable').destroy();
      }

      var choicesEl = $linePriority.select2('container').find('.select2-choices')[0];
      var sortable = new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        onStart: () =>
        {
          $linePriority.select2('onSortStart');
        },
        onEnd: () =>
        {
          $linePriority.select2('onSortEnd');

          this.saveLinePriority();
        }
      });

      $linePriority.data('sortable', sortable);

      this.sortables.push(sortable);

      $linePriority
        .select2('data', data)
        .select2('enable', !!selectedMrp.length);
    },

    setUpOrderPrioritySelect2: function()
    {
      const $orderPriority = this.$id('orderPriority').select2({
        allowClear: true,
        multiple: true,
        placeholder: this.t('settings:orderPriority:placeholder'),
        data: this.model.getAvailableOrderPriorities().map(id =>
        {
          return {
            id,
            text: this.t(`orderPriority:${id}`)
          };
        })
      });

      const choicesEl = $orderPriority.select2('container').find('.select2-choices')[0];

      this.sortables.push(new Sortable(choicesEl, {
        draggable: '.select2-search-choice',
        filter: '.select2-search-choice-close',
        onStart: () =>
        {
          $orderPriority.select2('onSortStart');
        },
        onEnd: () =>
        {
          $orderPriority.select2('onSortEnd').select2('focus');

          this.saveOrderPriority();
        }
      }));

      $orderPriority.on('change', () =>
      {
        this.saveOrderPriority();
      });

      $orderPriority.select2('enable', false);
    },

    selectLine: function(lineId)
    {
      const version = this.model.getVersion();
      const disabled = !lineId;
      const $mrpPriority = this.$id('mrpPriority');
      const $orderPriority = this.$id('orderPriority');
      const $orderGroupPriority = this.$id('orderGroupPriority');
      let activeTime = '';
      let extraCapacity = '';
      let workerCount = [0, 0, 0];

      this.$id('line').select2('val', lineId || '');

      if (!disabled)
      {
        let selectedLine = lineId;
        let line = this.model.lines.get(selectedLine);

        if (!line)
        {
          line = this.model.lines.add({_id: selectedLine}).get(selectedLine);
        }

        const mrpPriority = line.get('mrpPriority');

        $mrpPriority
          .select2('enable', true)
          .select2('data', mrpPriority.map(id =>
          {
            return {
              id,
              text: id
            };
          }));

        if (version > 1)
        {
          const orderPriority = line.get('orderPriority') || [];

          $orderPriority
            .select2('enable', true)
            .select2('data', orderPriority.map(id =>
            {
              return {
                id,
                text: this.t(`orderPriority:${id}`)
              };
            }));

          const orderGroupPriority = line.get('orderGroupPriority') || [];

          $orderGroupPriority
            .select2('enable', true)
            .select2('data', orderGroupPriority.map(id =>
            {
              const group = this.orderGroups.get(id);

              return {
                id,
                text: group ? group.getLabel() : id
              };
            }));

          extraCapacity = line.get('extraCapacity') || '';
          workerCount = line.get('workerCount') || workerCount;
        }

        activeTime = this.buildActiveTime(line.get('activeTime'));

        let selectedMrp = this.$id('mrp').select2('data');

        if (mrpPriority.length)
        {
          selectedMrp = selectedMrp && _.includes(mrpPriority, selectedMrp.id)
            ? selectedMrp.id
            : mrpPriority[0];
        }
        else
        {
          selectedMrp = null;
          selectedLine = null;
        }

        this.selectMrp(selectedMrp, selectedLine);
      }
      else
      {
        $mrpPriority
          .select2('enable', false)
          .select2('val', '');

        if (version > 1)
        {
          $orderPriority
            .select2('enable', false)
            .select2('val', '');

          $orderGroupPriority
            .select2('enable', false)
            .select2('val', '');
        }

        this.selectMrp(null, null);
      }

      this.$id('activeTime')
        .val(activeTime)
        .prop('disabled', disabled);

      this.$id('extraCapacity')
        .val(extraCapacity)
        .prop('disabled', disabled);

      if (version > 1)
      {
        this.$('input[name="workerCount"]').each((i, el) =>
        {
          el.value = workerCount[i];
          el.disabled = disabled;
        });
      }
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

      (mrp ? mrp.get('extraShiftSeconds') : [0, 0, 0]).forEach((v, i) =>
      {
        view.$id('extraShiftSeconds-' + (i + 1))
          .val(disabled ? '' : v)
          .prop('disabled', disabled);
      });

      view.$id('limitSmallOrders')
        .prop('checked', disabled ? false : mrp.get('limitSmallOrders'))
        .prop('disabled', disabled);

      [
        'extraOrderSeconds',
        'smallOrderQuantity',
        'bigOrderQuantity',
        'hardOrderManHours',
        'splitOrderQuantity',
        'maxSplitLineCount'
      ].forEach(prop =>
      {
        view.$id(prop)
          .val(disabled ? '' : mrp.get(prop))
          .prop('disabled', disabled);
      });

      [
        'hardComponents',
        'hardBigComponents'
      ].forEach(prop =>
      {
        var data = [];

        if (!disabled)
        {
          data = (mrp.get(prop) || []).map(function(nc12)
          {
            return {id: nc12, text: nc12};
          });
        }

        view.$id(prop)
          .select2('data', data)
          .select2('enable', enabled);
      });

      view.removeGroups();

      if (mrp)
      {
        mrp.get('groups').forEach(view.addGroup, view);
      }

      view.$id('addGroup').prop('disabled', disabled);

      view.setUpLinePrioritySelect2();
      view.setUpMrpLineSelect2();
      view.selectMrpLine(mrp, lineId, disabled);
    },

    selectMrpLine: function(mrp, lineId, disabled)
    {
      if (this.model.getVersion() === 2)
      {
        return;
      }

      let line = mrp ? mrp.lines.get(lineId) : null;

      this.$id('mrpLine').select2('val', lineId || '').select2('enable', !disabled);

      disabled = disabled || !this.$id('mrpLine').select2('data');

      if (!disabled && !line)
      {
        line = mrp.lines.add({_id: lineId}).get(lineId);
      }

      this.$('input[name="workerCount"]').each((i, el) =>
      {
        this.$(el)
          .val(disabled ? '' : line.get('workerCount')[el.dataset.index])
          .prop('disabled', disabled);
      });

      this.$id('orderPriority')
        .select2('val', disabled ? [] : line.get('orderPriority'))
        .prop('disabled', disabled);
    },

    saveLine: function(changes)
    {
      const selectedLine = this.$id('line').val();
      const lines = this.model.lines;
      const line = lines.get(selectedLine);

      if (line)
      {
        line.set(changes);
      }
      else
      {
        const attrs = {
          _id: selectedLine,
          mrpPriority: _.pluck(this.$id('mrpPriority').select2('data'), 'id'),
          orderGroupPriority: _.pluck(this.$id('orderGroupPriority').select2('data'), 'id'),
          activeTime: this.parseActiveTime(this.$id('activeTime')),
          extraCapacity: this.parseExtraCapacity(this.$id('extraCapacity'))
        };

        if (this.model.getVersion() > 1)
        {
          attrs.orderPriority = _.pluck(this.$id('orderPriority').select2('data'), 'id');
          attrs.workerCount = this.$('input[name="workerCount"]').map((i, el) => +el.value || 0).get();
        }

        lines.add(attrs);
      }
    },

    saveMrpPriority: function()
    {
      this.saveLine({
        mrpPriority: _.pluck(this.$id('mrpPriority').select2('data'), 'id')
      });

      this.setUpMrpSelect2();
    },

    saveOrderGroupPriority: function()
    {
      this.saveLine({
        orderGroupPriority: _.pluck(this.$id('orderGroupPriority').select2('data'), 'id')
      });
    },

    saveOrderPriority: function()
    {
      const orderPriority = _.pluck(this.$id('orderPriority').select2('data'), 'id');

      if (this.model.getVersion() === 1)
      {
        const mrp = this.model.mrps.get(this.$id('mrp').val());
        const mrpLine = mrp.lines.get(this.$id('mrpLine').val());

        mrpLine.set('orderPriority', orderPriority);
      }
      else
      {
        this.saveLine({orderPriority});
      }
    },

    saveLinePriority: function()
    {
      var mrp = this.model.mrps.get(this.$id('mrp').val());

      mrp.set('linePriority', _.pluck(this.$id('linePriority').select2('data'), 'id'));
    },

    buildActiveTime: function(activeTimes)
    {
      return (activeTimes || [])
        .map(activeTime => activeTime.from + '-' + activeTime.to)
        .join(', ');
    },

    parseActiveTime: function($property)
    {
      var activeTimes = $property.val().split(',').map(activeTime =>
      {
        var parts = activeTime.trim().split('-');

        return {
          from: parseTime(parts[0]),
          to: parseTime(parts[1])
        };
      }).filter(activeTime => !!activeTime.from && !!activeTime.to);

      $property.val(this.buildActiveTime(activeTimes));

      return activeTimes;

      function parseTime(input)
      {
        var parts = input.split(':');
        var hh = +parts[0];
        var mm = +parts[1] || 0;

        if (hh >= 0 && hh <= 24 && mm >= 0 && mm <= 59)
        {
          if (hh === 24)
          {
            hh = 0;
          }

          return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
        }

        return '';
      }
    },

    parseExtraCapacity: function($property)
    {
      var value = ($property.val() || '').trim();

      if (!/^[0-9]{1,3}%?$/.test(value) || value === '0%')
      {
        value = '0';
      }

      $property.val(value);

      return value;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.requiredStatuses = formData.requiredStatuses.join(',');
      formData.ignoredStatuses = formData.ignoredStatuses.join(',');
      formData.completedStatuses = formData.completedStatuses.join(',');
      formData.schedulingRate = this.formatSchedulingRate(formData.schedulingRate);
      formData.ignoredWorkCenters = this.formatIgnoredWorkCenters(formData.ignoredWorkCenters);

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

    addGroup: function(group)
    {
      var view = this;
      var $groups = view.$id('groups');

      $groups.append(this.renderPartialHtml(groupTemplate, {
        group: Object.assign({no: $groups.children().length + 1}, group)
      }));

      var $group = $groups.children().last();

      $group.find('[name="group.lines"]').select2({
        width: '500px',
        allowClear: true,
        multiple: true,
        data: this.lines,
        matcher: idAndTextMatcher,
        formatSelection: item => _.escape(item.id),
        formatResult: item =>
        {
          var id = item.id;

          while (id.length < view.maxLineLength)
          {
            id += ' ';
          }

          return '<small><span class="text-mono">'
            + id.replace(/ /g, '&nbsp;')
            + '</span>: '
            + item.text
            + '</small>';
        }
      });

      var $components = $group.find('[name="group.components"]').val('');

      view.setUpComponentsSelect2($components);

      $components.select2('data', group.components.map(c =>
      {
        return {
          id: c,
          text: c
        };
      }));
    },

    removeGroups: function()
    {
      var $groups = this.$id('groups');

      $groups.find('.select2-container + input').select2('destroy');
      $groups.html('');
    },

    serializeGroups: function()
    {
      var view = this;
      var groups = [];

      view.$id('groups').find('tr').each(function(i)
      {
        var $group = view.$(this);

        $group.find('td').first().text((i + 1) + '.');

        var group = {
          splitOrderQuantity: Math.max(0, $group.find('[name="group.splitOrderQuantity"]').val() || 0),
          lines: $group.find('[name="group.lines"]')
            .val()
            .split(',')
            .filter(function(v) { return !!v.length; }),
          components: $group.find('[name="group.components"]')
            .val()
            .split(',')
            .filter(function(v) { return !!v.length; })
        };

        if (group.lines.length)
        {
          groups.push(group);
        }
      });

      return groups;
    },

    updateProperty: function(object, property, index)
    {
      var o = this.model;
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

      if (!o)
      {
        return;
      }

      var $property = this.$id(property);

      if (!$property.length)
      {
        $property = this.$('[name="' + property + '"]');
      }

      if (!$property.length && property !== 'group')
      {
        return;
      }

      if (index >= 0)
      {
        $property = $property.filter('[data-index="' + index + '"]');
      }

      switch (property)
      {
        case 'requiredStatuses':
        case 'ignoredStatuses':
        case 'completedStatuses':
        case 'hardComponents':
        case 'hardBigComponents':
        case 'orderPriority':
        case 'linePriority':
          v = $property.val().split(',').filter(function(v) { return v.length > 0; });
          break;

        case 'schedulingRate':
        {
          v = {ANY: 1};

          $property.val().split('\n').forEach(function(line)
          {
            var matches = line.match(/([0-9,.]+)/);

            if (!matches)
            {
              return;
            }

            var value = Math.max(0, parseFloat(matches[1].replace(',', '.')) || 0) || 1;

            line.replace(matches[0], '').split(/[^A-Za-z0-9]/).forEach(function(mrp)
            {
              if (mrp.length >= 3)
              {
                v[mrp.toUpperCase()] = value;
              }
            });
          });

          break;
        }

        case 'ignoredWorkCenters':
          v = $property
            .val()
            .split(',')
            .map(function(v) { return v.trim(); })
            .filter(function(v) { return v.length; });
          break;

        case 'forceWorkDay':
        case 'ignoreCompleted':
        case 'useRemainingQuantity':
        case 'limitSmallOrders':
          v = $property.prop('checked');
          break;

        case 'freezeHour':
        case 'lateHour':
        case 'etoPilotHour':
        case 'minIncompleteDuration':
        case 'extraOrderSeconds':
        case 'smallOrderQuantity':
        case 'bigOrderQuantity':
        case 'splitOrderQuantity':
        case 'maxSplitLineCount':
          v = Math.max(0, parseInt($property.val(), 10) || 0);
          break;

        case 'workerCount':
          v = Math.max(0, +parseFloat($property.val()).toFixed(2) || 0);
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

        case 'activeTime':
          v = this.parseActiveTime($property);
          break;

        case 'extraCapacity':
          v = this.parseExtraCapacity($property);
          break;

        default:
        {
          if (/^group/.test(property))
          {
            property = 'groups';
            v = this.serializeGroups();
          }

          break;
        }
      }

      if (v !== undefined)
      {
        if (index >= 0)
        {
          if (!Array.isArray(o.attributes[property]))
          {
            return;
          }

          o.attributes[property][index] = v;
        }
        else
        {
          o.attributes[property] = v;
        }
      }
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
        text: this.t('settings:msg:success')
      });
    },

    handleFailure: function()
    {
      FormView.prototype.handleFailure.apply(this, arguments);

      this.$id('submit').prop('disabled', false);
    },

    getFailureText: function()
    {
      return this.t('settings:msg:failure');
    },

    formatSchedulingRate: function(schedulingRate)
    {
      var view = this;
      var formatted = [
        view.formatSchedulingRateNumber(schedulingRate.ANY || 1) + ': ANY'
      ];
      var rateToMrp = {};

      Object.keys(schedulingRate).forEach(function(mrp)
      {
        if (mrp === 'ANY')
        {
          return;
        }

        var rate = view.formatSchedulingRateNumber(schedulingRate[mrp]);

        if (!rateToMrp[rate])
        {
          rateToMrp[rate] = [];
        }

        rateToMrp[rate].push(mrp);
      });

      Object.keys(rateToMrp).forEach(function(rate)
      {
        formatted.push(rate + ': ' + rateToMrp[rate].sort().join(', '));
      });

      return formatted.join('\n');
    },

    formatSchedulingRateNumber: function(n)
    {
      var str = n.toString();

      if (str.indexOf('.') === -1)
      {
        str += '.0000';
      }
      else
      {
        while (str.length < 6)
        {
          str += '0';
        }
      }

      return str.replace('.', decimalSeparator);
    },

    formatIgnoredWorkCenters: function(ignoredWorkCenters)
    {
      return Array.isArray(ignoredWorkCenters) ? ignoredWorkCenters.join(', ') : '';
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
          case 'completedStatuses':
            view.$id(property).select2('val', value);
            break;

          case 'schedulingRate':
            view.$id(property).val(view.formatSchedulingRate(value));
            break;

          case 'ignoredWorkCenters':
            view.$id(property).val(view.formatIgnoredWorkCenters(value));
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
      var mrpLocked = this.model.isMrpLocked(selectedMrp);
      var lineLocked = this.model.isLineLocked(selectedLine);

      if (lineLocked)
      {
        selectedLine = null;
      }

      if (lineLocked || changed.lines[selectedLine])
      {
        this.selectLine(selectedLine);
      }

      if (mrpLocked)
      {
        selectedMrp = null;
        selectedMrpLine = null;
      }

      if (mrpLocked || changed.mrps[selectedMrp])
      {
        this.selectMrp(selectedMrp, selectedMrpLine);
      }

      if (changed.locked)
      {
        this.cacheLines();
        this.setUpLineSelect2();
        this.setUpMrpSelect2();
      }

      if (activeEl)
      {
        activeEl.focus();
      }
    }

  });
});
