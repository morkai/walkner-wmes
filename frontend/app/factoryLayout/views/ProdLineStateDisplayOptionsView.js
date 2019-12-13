// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'js2form',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/getShiftStartInfo',
  'app/factoryLayout/views/OrgUnitPickerView',
  'app/factoryLayout/templates/displayOptions'
], function(
  $,
  _,
  js2form,
  t,
  time,
  viewport,
  View,
  buttonGroup,
  getShiftStartInfo,
  OrgUnitPickerView,
  displayOptionsTemplate
) {
  'use strict';

  return View.extend({

    template: displayOptionsTemplate,

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        this.loadHistory();
      },
      'change [name="statuses[]"]': function()
      {
        this.model.set('statuses', buttonGroup.getValue(this.$id('statuses')));
      },
      'change [name="states[]"]': function()
      {
        this.model.set('states', buttonGroup.getValue(this.$id('states')));
      },
      'change [name="blacklisted"]': function()
      {
        this.model.set('blacklisted', buttonGroup.getValue(this.$id('blacklisted')) === '1');
      },
      'click #-showPicker': function()
      {
        var orgUnitPickerView = new OrgUnitPickerView({
          model: {
            orgUnitType: this.model.get('orgUnitType'),
            orgUnitIds: this.model.get('orgUnitIds')
          }
        });

        this.listenTo(orgUnitPickerView, 'picked', function(orgUnitType, orgUnitIds)
        {
          viewport.closeDialog();

          this.model.set({
            orgUnitType: orgUnitType,
            orgUnitIds: orgUnitIds
          });
        });

        viewport.showDialog(orgUnitPickerView, this.t('picker:title'));
      },
      'click #-save': function()
      {
        this.model.save();

        viewport.msg.show({
          type: 'success',
          time: 1000,
          text: this.t('options:saved')
        });
      },
      'click #-resetHistory': function()
      {
        this.$id('from').val('');
        this.$id('to').val('');
        this.$id('shifts').find('input').prop('checked', true);

        buttonGroup.toggle(this.$id('shifts'));

        this.model.set({
          from: null,
          to: null,
          shifts: ['1', '2', '3']
        });
      }
    },

    getTemplateData: function()
    {
      return {
        minDate: window.PRODUCTION_DATA_START_DATE || '',
        maxDate: getShiftStartInfo(Date.now()).moment.format('YYYY-MM-DD')
      };
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('statuses'));
      buttonGroup.toggle(this.$id('states'));
      buttonGroup.toggle(this.$id('blacklisted'));
      buttonGroup.toggle(this.$id('shifts'));

      this.toggleHistoryData();
    },

    serializeFormData: function()
    {
      var from = this.model.get('from');
      var to = this.model.get('to');

      return {
        statuses: this.model.get('statuses'),
        states: this.model.get('states'),
        blacklisted: this.model.get('blacklisted') ? '1' : '0',
        from: _.isNumber(from) ? time.format(from, 'YYYY-MM-DD') : '',
        to: _.isNumber(to) ? time.format(to, 'YYYY-MM-DD') : '',
        shifts: this.model.get('shifts')
      };
    },

    loadHistory: function()
    {
      var $from = this.$id('from');
      var $to = this.$id('to');
      var $shifts = this.$id('shifts');

      var fromMoment = time.getMoment($from.val());
      var toMoment = time.getMoment($to.val());

      if (!fromMoment.isValid() || !toMoment.isValid())
      {
        return;
      }

      if (fromMoment.valueOf() > toMoment.valueOf())
      {
        var moment = fromMoment;

        fromMoment = toMoment;
        toMoment = moment;
      }

      if (toMoment.valueOf() === fromMoment.valueOf())
      {
        toMoment.add(1, 'days');
      }
      else if (toMoment.valueOf() - fromMoment.valueOf() > (7 * 24 * 3600 * 1000))
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2500,
          text: this.t('msg:historyDataRange')
        });
      }

      $from.val(fromMoment.format('YYYY-MM-DD'));
      $to.val(toMoment.format('YYYY-MM-DD'));

      var shifts = buttonGroup.getValue($shifts);

      if (shifts.length === 0)
      {
        shifts = ['1', '2', '3'];

        $shifts.find('input').prop('checked', true);
        buttonGroup.toggle($shifts);
      }

      this.model.set({
        from: fromMoment.valueOf(),
        to: toMoment.valueOf(),
        shifts: shifts
      });
    },

    toggleHistoryData: function()
    {
      var disabled = this.model.isHistoryData();

      this.$id('statuses').find('.btn').toggleClass('disabled', disabled);
      this.$id('states').find('.btn').toggleClass('disabled', disabled);
      this.$id('blacklisted').find('.btn').toggleClass('disabled', disabled);
      this.$id('save').toggleClass('disabled', disabled);
    }

  });
});
