// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/data/aors',
  'app/data/downtimeReasons',
  'app/data/delayReasons',
  'app/data/orderStatuses',
  'app/settings/views/SettingsView',
  'app/reports/templates/settings',
  'app/reports/templates/settings/rearmDowntimeRow',
  'app/reports/templates/settings/rearmMetricRow'
], function(
  _,
  user,
  idAndLabel,
  orgUnits,
  aors,
  downtimeReasons,
  delayReasons,
  orderStatuses,
  SettingsView,
  template,
  rearmDowntimeRowTemplate,
  rearmMetricRowTemplate
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#reports;settings',
    defaultTab: 'efficiency',

    template: template,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render',
      'aors.synced': 'render',
      'downtimeReasons.synced': 'render'
    },

    events: _.assign({
      'change [name$="prodTask"]': 'updateSettingOnInputChange',
      'change [name$="id"]': 'updateSettingOnInputChange',
      'change [name$="aors"]': 'updateSettingOnInputChange',
      'change #-downtimesInAors-specificAor': 'updateSettingOnInputChange',
      'change [name$="Subdivision"]': 'updateSettingOnInputChange',
      'change [name$="DowntimeReasons"]': 'updateSettingOnInputChange',
      'change [name$="ProdTasks"]': 'updateSettingOnInputChange',
      'change [name$="ProdFlows"]': 'updateSettingOnInputChange',
      'change [data-select2-setting]': 'updateSettingOnInputChange',
      'change [name="downtimesInAorsType"]': function(e)
      {
        var aors = e.target.value === 'own' ? 'own' : '';

        this.updateSetting('reports.downtimesInAors.aors', aors);
        this.toggleDowntimesInAors(aors);
      },
      'click .btn[data-rearm-action$=".moveUp"]': function(e)
      {
        const setting = 'rearm.' + e.currentTarget.dataset.rearmAction.split('.')[0];
        const {variable} = this.$(e.currentTarget).closest('tr')[0].dataset;
        const columns = [...this.model.getValue(setting, [])];
        const oldI = columns.findIndex(c => c.variable === variable);

        if (oldI === -1)
        {
          return;
        }

        if (oldI === 0)
        {
          columns.push(columns.shift());
        }
        else
        {
          columns.splice(oldI - 1, 0, columns.splice(oldI, 1)[0]);
        }

        this.updateRearmColumnsSetting(setting, columns);
      },
      'click .btn[data-rearm-action$=".moveDown"]': function(e)
      {
        const setting = 'rearm.' + e.currentTarget.dataset.rearmAction.split('.')[0];
        const {variable} = this.$(e.currentTarget).closest('tr')[0].dataset;
        const columns = [...this.model.getValue(setting, [])];
        const oldI = columns.findIndex(c => c.variable === variable);

        if (oldI === -1)
        {
          return;
        }

        if (oldI === columns.length - 1)
        {
          columns.unshift(columns.pop());
        }
        else
        {
          columns.splice(oldI + 1, 0, columns.splice(oldI, 1)[0]);
        }

        this.updateRearmColumnsSetting(setting, columns);
      },
      'click .btn[data-rearm-action$=".delete"]': function(e)
      {
        const setting = 'rearm.' + e.currentTarget.dataset.rearmAction.split('.')[0];
        const {variable} = this.$(e.currentTarget).closest('tr')[0].dataset;
        const columns = this.model.getValue(setting, []).filter(c => c.variable !== variable);

        this.updateRearmColumnsSetting(setting, columns);
      },
      'click .btn[data-rearm-action="downtimeColumns.edit"]': function(e)
      {
        this.updateSelectedRearmDowntimeColumn(this.$(e.currentTarget).closest('tr')[0].dataset.variable);
      },
      'click #-rearm-downtimeColumns-submit': function()
      {
        this.saveSelectedRearmDowntimeColumn();
      },
      'click #-rearm-downtimeColumns-reset': function()
      {
        this.resetSelectedRearmDowntimeColumn();
      },
      'click .btn[data-rearm-action="metricColumns.edit"]': function(e)
      {
        this.updateSelectedRearmMetricColumn(this.$(e.currentTarget).closest('tr')[0].dataset.variable);
      },
      'click #-rearm-metricColumns-submit': function()
      {
        this.saveSelectedRearmMetricColumn();
      },
      'click #-rearm-metricColumns-reset': function()
      {
        this.resetSelectedRearmMetricColumn();
      }
    }, SettingsView.prototype.events),

    initialize: function()
    {
      SettingsView.prototype.initialize.apply(this, arguments);

      this.userPrivileges = {};
    },

    serialize: function()
    {
      return _.assign(SettingsView.prototype.serialize.call(this), {
        divisions: this.serializeProdDivisions(),
        colors: this.serializeColors()
      });
    },

    serializeProdDivisions: function()
    {
      return orgUnits.getAllDivisions()
        .filter(function(division)
        {
          return division.get('type') === 'prod';
        })
        .map(function(division)
        {
          return {
            _id: division.id,
            label: division.getLabel(),
            subdivisions: orgUnits.getChildren(division)
              .map(function(subdivision)
              {
                return {
                  _id: subdivision.id,
                  label: subdivision.getLabel()
                };
              })
              .sort(function(a, b)
              {
                return a.label.localeCompare(b.label, undefined, {numeric: true, ignorePunctuation: true});
              })
          };
        })
        .sort(function(a, b)
        {
          return a.label.localeCompare(b.label, undefined, {numeric: true, ignorePunctuation: true});
        });
    },

    serializeStorageSubdivisions: function()
    {
      return orgUnits.getAllByType('subdivision')
        .filter(function(subdivision)
        {
          return subdivision.get('type') === 'storage';
        })
        .map(function(subdivision)
        {
          return {
            id: subdivision.id,
            text: subdivision.get('division') + ' \\ ' + subdivision.get('name')
          };
        })
        .sort(function(a, b)
        {
          return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
        });
    },

    serializeColors: function()
    {
      var colors = {};

      [
        'quantityDone',
        'lmh', 'mmh',
        'efficiency',
        'productivity', 'productivityNoWh',
        'scheduledDowntime', 'unscheduledDowntime',
        'clipOrderCount', 'clipProduction', 'clipEndToEnd',
        'direct', 'directRef',
        'indirect', 'indirectRef',
        'warehouse', 'warehouseRef',
        'absence', 'absenceRef',
        'dirIndir', 'dirIndirRef',
        'eff', 'ineff',
        'hrTotal'
      ].forEach(function(metric)
      {
        colors[metric] = this.settings.getColor(metric);
      }, this);

      return colors;
    },

    afterRender: function()
    {
      SettingsView.prototype.afterRender.call(this);

      var storageSubdivisions = this.serializeStorageSubdivisions();

      this.$id('wh-comp-id').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: storageSubdivisions
      });

      this.$id('wh-finGoods-id').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: storageSubdivisions
      });

      this.$('input[name$="prodTask"]').select2({
        width: '374px',
        allowClear: true,
        placeholder: ' ',
        data: this.prodTasks.serializeToSelect2()
      });

      var aorsData = aors.map(idAndLabel);

      this.$('input[name$="aors"]').select2({
        allowClear: true,
        multiple: true,
        placeholder: ' ',
        data: aorsData
      });

      this.$id('downtimesInAors-specificAor').select2({
        allowClear: true,
        placeholder: ' ',
        data: aorsData
      });

      this.setUpLeanSettings();
      this.setUpClipSettings();
      this.setUpRearmSettings();

      this.onSettingsChange(this.settings.get('reports.downtimesInAors.statuses'));
      this.onSettingsChange(this.settings.get('reports.clip.ignoredMrps'));
      this.toggleDowntimesInAors(this.settings.getValue('downtimesInAors.aors'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      if (setting.id === 'reports.clip.ignoredMrps')
      {
        return false;
      }

      return true;
    },

    updateSettingField: function(setting)
    {
      if (setting.id === 'reports.rearm.downtimeColumns')
      {
        this.renderRearmDowntimeColumns();
        this.updateSelectedRearmDowntimeColumn();

        return;
      }

      if (setting.id === 'reports.rearm.metricColumns')
      {
        this.renderRearmMetricColumns();
        this.updateSelectedRearmMetricColumn();

        return;
      }

      var $el = this.$('input[name="' + setting.id + '"]');

      if (setting.id === 'reports.clip.ignoredMrps')
      {
        return $el.select2('data', setting.getValue().map(function(mrp)
        {
          return {
            id: mrp,
            text: mrp
          };
        }));
      }

      if ($el.hasClass('select2-offscreen'))
      {
        return $el.select2('val', setting.getValue());
      }
    },

    toggleDowntimesInAors: function(aors)
    {
      if (aors === null || aors === 'own')
      {
        this.$('input[name="downtimesInAorsType"][value="own"]').prop('checked', true);
        this.$id('downtimesInAors-aors').select2('enable', false).select2('data', null);
      }
      else
      {
        this.$('input[name="downtimesInAorsType"][value="specific"]').prop('checked', true);
        this.$id('downtimesInAors-aors').select2('enable', true);
      }
    },

    toggleTabPrivileges: function()
    {
      var userPrivileges = this.userPrivileges = {
        all: false
      };

      if (user.isAllowedTo('REPORTS:VIEW'))
      {
        userPrivileges.all = true;

        return;
      }

      this.$('.list-group-item[data-privileges]').each(function()
      {
        var requiredPrivileges = this.dataset.privileges.split(',');

        for (var i = 0; i < requiredPrivileges.length; ++i)
        {
          var requiredPrivilege = 'REPORTS:' + requiredPrivileges[i] + ':VIEW';

          if (userPrivileges[requiredPrivilege] === undefined)
          {
            userPrivileges[requiredPrivilege] = user.isAllowedTo(requiredPrivilege);
          }

          if (!userPrivileges[requiredPrivilege])
          {
            this.classList.add('disabled');
          }
        }
      });
    },

    updateSettingOnInputChange: function(e)
    {
      this.updateSetting(e.target.name, e.target.value);
    },

    setUpLeanSettings: function()
    {
      var view = this;
      var subdivisions = orgUnits.getAllByType('subdivision').map(function(subdivision)
      {
        return {
          id: subdivision.id,
          text: subdivision.get('division') + ' \\ ' + subdivision.getLabel()
        };
      });
      var reasons = downtimeReasons.map(idAndLabel);
      var prodTasks = this.prodTasks.serializeToSelect2();
      var prodFlows = this.serializeLeanProdFlows();

      this.$('input[name$="Subdivision"]').each(function()
      {
        view.$(this).select2({
          width: 374,
          allowClear: true,
          placeholder: ' ',
          data: subdivisions
        });
      });

      this.$('input[name$="DowntimeReasons"]').each(function()
      {
        view.$(this).select2({
          width: '100%',
          multiple: true,
          allowClear: true,
          placeholder: ' ',
          data: reasons
        });
      });

      this.$('input[name$="ProdTasks"]').each(function()
      {
        view.$(this).select2({
          width: '100%',
          multiple: true,
          allowClear: true,
          placeholder: ' ',
          data: prodTasks
        });
      });

      this.$('input[name$="ProdFlows"]').each(function()
      {
        view.$(this).select2({
          width: '100%',
          multiple: true,
          allowClear: true,
          placeholder: ' ',
          data: prodFlows,
          formatResult: function(item, $container, query, e)
          {
            return item.deactivated
              ? ('<span style="text-decoration: line-through">' + e(item.text) + '</span>')
              : e(item.text);
          },
          formatSelection: function(item, $container, e)
          {
            var prodFlowLabel = item.deactivated
              ? ('<span style="text-decoration: line-through">' + e(item.text) + '</span>')
              : e(item.text);

            return item.divisionId + ': ' + prodFlowLabel;
          }
        });
      });
    },

    setUpClipSettings: function()
    {
      var view = this;

      view.$id('clip-ignoredMrps').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        minimumResultsForSearch: -1,
        dropdownCssClass: 'hidden',
        data: [],
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/[A-Z0-9]{3,}[^A-Z0-9]/ig) || []).forEach(function(mrp)
          {
            result = result.replace(mrp, '');

            mrp = mrp.toUpperCase().replace(/[^A-Z0-9]+/g, '');

            if (!options[mrp])
            {
              selectCallback({id: mrp, text: mrp});
              options[mrp] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      view.$id('clip-ignoredDelayReasons').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: this.delayReasons.map(idAndLabel)
      });

      var statuses = orderStatuses.map(idAndLabel);

      [
        'ignoredStatuses',
        'requiredStatuses',
        'productionStatuses',
        'endToEndStatuses',
        'orderFilterStatuses'
      ].forEach(function(setting)
      {
        view.$id('clip-' + setting).select2({
          width: '100%',
          allowClear: true,
          placeholder: ' ',
          multiple: true,
          data: statuses
        });
      });
    },

    serializeLeanProdFlows: function()
    {
      var subdivisionToProdFlows = {};

      _.forEach(orgUnits.getAllByType('prodFlow'), function(prodFlow)
      {
        var subdivision = prodFlow.getSubdivision();

        if (!subdivision)
        {
          return;
        }

        if (!subdivisionToProdFlows[subdivision.id])
        {
          subdivisionToProdFlows[subdivision.id] = [];
        }

        subdivisionToProdFlows[subdivision.id].push({
          id: prodFlow.id,
          text: prodFlow.getLabel(),
          divisionId: subdivision.get('division'),
          deactivated: !!prodFlow.get('deactivatedAt')
        });
      });

      var result = [];

      orgUnits.getAllByType('division').filter(function(d) { return d.get('type') === 'prod'; }).forEach(function(d)
      {
        orgUnits.getChildren(d).forEach(function(subdivision)
        {
          if (subdivision.get('type') !== 'assembly')
          {
            return;
          }

          result.push({
            text: d.id,
            children: subdivisionToProdFlows[subdivision.id] || []
          });
        });
      });

      return result;
    },

    setUpRearmSettings: function()
    {
      this.$id('rearm-downtimeColumns-reasons').select2({
        width: '100%',
        multiple: true,
        allowClear: true,
        data: downtimeReasons.map(idAndLabel)
      });

      this.renderRearmDowntimeColumns();
      this.renderRearmMetricColumns();
    },

    renderRearmDowntimeColumns: function()
    {
      let html = '';

      this.model.getValue('rearm.downtimeColumns', []).forEach(c =>
      {
        html += this.renderPartialHtml(rearmDowntimeRowTemplate, {
          row: {
            ...c,
            reasons: c.reasons.map(id => downtimeReasons.getLabel(id))
          }
        });
      });

      this.$id('rearm-downtimeColumns-table').html(html);

      this.updateAvailRearmVars();
    },

    resetSelectedRearmDowntimeColumn: function()
    {
      this.$id('rearm-downtimeColumns-variable').val('');
      this.$id('rearm-downtimeColumns-column').val('');
      this.$id('rearm-downtimeColumns-description').val('');
      this.$('input[name="rearm-downtimeColumns-exclude"][value="false"]').prop('checked', true);
      this.$id('rearm-downtimeColumns-reasons').select2('val', []);
    },

    updateSelectedRearmDowntimeColumn: function(variable)
    {
      if (!variable)
      {
        variable = this.$id('rearm-downtimeColumns-variable').val();
      }

      if (!variable)
      {
        return;
      }

      const column = this.model.getValue('rearm.downtimeColumns', []).find(c => c.variable === variable);

      if (!column)
      {
        return;
      }

      this.$id('rearm-downtimeColumns-variable').val(column.variable);
      this.$id('rearm-downtimeColumns-column').val(column.column);
      this.$id('rearm-downtimeColumns-description').val(column.description);
      this.$(`input[name="rearm-downtimeColumns-exclude"][value="${column.exclude}"]`).prop('checked', true);
      this.$id('rearm-downtimeColumns-reasons').select2('val', column.reasons);
    },

    saveSelectedRearmDowntimeColumn: function()
    {
      const $variable = this.$id('rearm-downtimeColumns-variable');
      const $column = this.$id('rearm-downtimeColumns-column');
      const $description = this.$id('rearm-downtimeColumns-description');
      const $exclude = this.$(`input[name="rearm-downtimeColumns-exclude"]:checked`);
      const $reasons = this.$id('rearm-downtimeColumns-reasons');
      const column = {
        variable: $variable.val().trim(),
        column: $column.val().trim(),
        description: $description.val().trim(),
        exclude: !!$exclude.length && $exclude.val() === 'true',
        reasons: $reasons.select2('val')
      };

      if (!column.variable || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(column.variable))
      {
        $variable.focus();

        return;
      }

      if (!column.column)
      {
        column.column = column.variable;
      }

      const columns = [...this.model.getValue('rearm.downtimeColumns', [])];
      const i = columns.findIndex(c => c.variable === column.variable);

      if (i === -1)
      {
        columns.push(column);
      }
      else
      {
        columns[i] = column;
      }

      this.updateRearmColumnsSetting('rearm.downtimeColumns', columns);
    },

    renderRearmMetricColumns: function()
    {
      let html = '';

      this.model.getValue('rearm.metricColumns', []).forEach(c =>
      {
        html += this.renderPartialHtml(rearmMetricRowTemplate, {
          row: c
        });
      });

      this.$id('rearm-metricColumns-table').html(html);

      this.updateAvailRearmVars();
    },

    resetSelectedRearmMetricColumn: function()
    {
      this.$id('rearm-metricColumns-variable').val('');
      this.$id('rearm-metricColumns-column').val('');
      this.$id('rearm-metricColumns-description').val('');
      this.$id('rearm-metricColumns-formula').val('');
    },

    updateSelectedRearmMetricColumn: function(variable)
    {
      if (!variable)
      {
        variable = this.$id('rearm-metricColumns-variable').val();
      }

      if (!variable)
      {
        return;
      }

      const column = this.model.getValue('rearm.metricColumns', []).find(c => c.variable === variable);

      if (!column)
      {
        return;
      }

      this.$id('rearm-metricColumns-variable').val(column.variable);
      this.$id('rearm-metricColumns-column').val(column.column);
      this.$id('rearm-metricColumns-description').val(column.description);
      this.$id('rearm-metricColumns-formula').val(column.formula);
    },

    saveSelectedRearmMetricColumn: function()
    {
      const $variable = this.$id('rearm-metricColumns-variable');
      const $column = this.$id('rearm-metricColumns-column');
      const $description = this.$id('rearm-metricColumns-description');
      const $formula = this.$id('rearm-metricColumns-formula');
      const column = {
        variable: $variable.val().trim(),
        column: $column.val().trim(),
        description: $description.val().trim(),
        formula: $formula.val().trim()
      };

      if (!column.variable || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(column.variable))
      {
        $variable.focus();

        return;
      }

      if (!column.column)
      {
        column.column = column.variable;
      }

      if (!column.formula)
      {
        column.formula = '0';
      }

      const columns = [...this.model.getValue('rearm.metricColumns', [])];
      const i = columns.findIndex(c => c.variable === column.variable);

      if (i === -1)
      {
        columns.push(column);
      }
      else
      {
        columns[i] = column;
      }

      this.updateRearmColumnsSetting('rearm.metricColumns', columns);
    },

    updateRearmColumnsSetting: function(setting, newValue)
    {
      const $fields = this.$(`.panel-body[data-subtab="${setting.split('.').pop()}"]`)
        .find('button, input, textarea')
        .prop('disabled', true);

      this.updateSetting(`reports.${setting}`, newValue).always(() =>
      {
        $fields.prop('disabled', false);
      });
    },

    updateAvailRearmVars: function()
    {
      const vars = {
        IDLE: 1,
        TT_SAP: 1,
        TT_AVG: 1,
        TT_MED: 1,
        FIRST_AT: 1,
        LAST_AT: 1,
        PREV_AT: 1,
        STARTED_AT: 1,
        FINISHED_AT: 1,
        QTY_DONE: 1,
        WORKER_COUNT: 1,
        EFF: 1,
        EFF_COEFF: 1,
        LABOR_TIME: 1
      };

      this.model.getValue('rearm.downtimeColumns', []).forEach(c => vars[c.variable] = 1);
      this.model.getValue('rearm.metricColumns', []).forEach(c => vars[c.variable] = 1);

      this.$id('rearm-availVars').html(Object.keys(vars).map(v => `<code>${v}</code>`).join(', '));
    }

  });
});
