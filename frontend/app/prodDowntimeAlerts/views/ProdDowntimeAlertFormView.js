// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/data/orgUnits',
  'app/data/downtimeReasons',
  'app/data/aors',
  '../ProdDowntimeAlert',
  'app/prodDowntimeAlerts/templates/formAction',
  'app/prodDowntimeAlerts/templates/form'
], function(
  _,
  $,
  t,
  time,
  FormView,
  idAndLabel,
  setUpUserSelect2,
  orgUnits,
  downtimeReasons,
  aors,
  ProdDowntimeAlert,
  actionTemplate,
  template
) {
  'use strict';

  var conditionData = {
    reason: function()
    {
      return downtimeReasons.map(idAndLabel);
    },
    aor: function()
    {
      return aors.map(idAndLabel);
    },
    division: function()
    {
      return getOrgUnitConditionData('division');
    },
    subdivision: function()
    {
      return getOrgUnitConditionData('subdivision', function(d)
      {
        return {
          id: d.id,
          text: d.get('division') + ' \\ ' + d.get('name')
        };
      });
    },
    mrpController: function()
    {
      return getOrgUnitConditionData('mrpController');
    },
    prodFlow: function()
    {
      return getOrgUnitConditionData('prodFlow');
    },
    workCenter: function()
    {
      return getOrgUnitConditionData('workCenter');
    },
    prodLine: function()
    {
      return getOrgUnitConditionData('prodLine');
    }
  };

  function getOrgUnitConditionData(type, map)
  {
    return orgUnits.getAllByType(type)
      .filter(function(d) { return !d.get('deactivatedAt'); })
      .map(map || idAndLabel);
  }

  function formatUserSelect2Text(user, name)
  {
    return name;
  }

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-conditions-add': function()
      {
        var $conditionType = this.$id('conditionTypes');
        var conditionType = $conditionType.val();

        if (conditionType === '')
        {
          return;
        }

        var $condition = this.$id('conditions-' + conditionType);

        $condition.closest('.form-group').removeClass('hidden');
        $condition.select2('data', null).select2('focus');

        var selectedOption = $conditionType[0].selectedOptions[0];

        selectedOption.selected = false;
        selectedOption.disabled = true;
        selectedOption.hidden = true;

        $conditionType.val('');

        this.onConditionsChange();
      },

      'click .prodDowntimeAlerts-form-condition-remove': function(e)
      {
        var $group = this.$(e.target).closest('.form-group').addClass('hidden');
        var type = $group.attr('data-type');

        this.$id('conditions-' + type).select2('data', null);

        this.$id('conditionTypes').find('option[value="' + type + '"]').prop({
          disabled: false,
          hidden: false
        });

        this.onConditionsChange();
      },

      'change input[name$="values"]': 'onConditionsChange',

      'click #-actions-add': function()
      {
        var $action = $(actionTemplate({
          i: ++this.actionCounter,
          action: {
            delaySeconds: 0
          }
        }));

        this.$id('actions').append($action);

        this.setUpActionSelect2($action);
        this.onActionsChange();

        $action.find('[name$="delay"]').focus();
      },

      'change .prodDowntimeAlerts-form-action-delay': function(e)
      {
        var delayEl = e.target;
        var seconds = time.toSeconds(e.target.value) || 0;

        delayEl.value = time.toString(seconds);

        delayEl.parentNode.dataset.delay = seconds;

        this.sortActions();
        this.recountActions();
      },

      'click .prodDowntimeAlerts-form-action-remove': function(e)
      {
        this.$(e.target).closest('.prodDowntimeAlerts-form-action').remove();

        this.sortActions();
        this.recountActions();
        this.onActionsChange();
      },

      'keyup #-actions-validity': function(e)
      {
        if (e.keyCode === 32)
        {
          this.$id('actions-add').click();
        }

        return false;
      },

      'keydown #-actions-validity': function(e)
      {
        if (e.keyCode === 13)
        {
          this.$id('actions-add').click();
        }

        return false;
      },

      'change .js-actionsValidity': 'toggleActionsValidity',

      'change #-repeatInterval': function(e)
      {
        e.target.value = time.toString(time.toSeconds(e.target.value) || 0);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.actionCounter = 0;
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderAction: actionTemplate,
        conditions: this.serializeConditions(),
        actions: this.serializeActions()
      });
    },

    serializeConditions: function()
    {
      var conditions = this.model.get('conditions') || [];
      var typeToCondition = {};
      var result = [];

      _.forEach(conditions, function(condition) { typeToCondition[condition.type] = condition; });

      _.forEach(ProdDowntimeAlert.CONDITION_TYPES, function(conditionType)
      {
        var condition = typeToCondition[conditionType];

        result.push({
          hidden: !condition,
          mode: condition ? condition.mode : 'include',
          type: conditionType,
          values: condition ? condition.values.join(',') : ''
        });
      });

      this.conditions = result;

      return result;
    },

    serializeActions: function()
    {
      this.actions = _.map(this.model.get('actions'), function(action, i)
      {
        return _.assign({}, action, {
          no: i + 1,
          delaySeconds: action.delay,
          delay: time.toString(action.delay),
          userWhitelist: _.pluck(action.userWhitelist, 'id').join(','),
          userBlacklist: _.pluck(action.userBlacklist, 'id').join(',')
        });
      });

      return this.actions;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.repeatInterval = time.toString(formData.repeatInterval);
      formData.conditions = this.conditions;
      formData.actions = this.actions;
      formData.userWhitelist = _.pluck(formData.userWhitelist, 'id').join(',');
      formData.userBlacklist = _.pluck(formData.userBlacklist, 'id').join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;
      var $actions = view.$('.prodDowntimeAlerts-form-action');
      var serializeUsers = function($users)
      {
        return _.map($users.select2('data'), function(d)
        {
          return {
            id: d.id,
            label: d.text
          };
        });
      };

      formData.repeatInterval = time.toSeconds(formData.repeatInterval) || 0;

      formData.conditions = formData.conditions
        .filter(function(d) { return !_.isEmpty(d.values); })
        .map(function(d)
        {
          var condition = {
            mode: d.mode,
            type: d.type,
            labels: [],
            values: []
          };

          _.forEach(view.$id('conditions-' + d.type).select2('data'), function(d)
          {
            condition.labels.push(d.text);
            condition.values.push(d.id);
          });

          return condition;
        });

      formData.actions = (formData.actions || [])
        .map(function(action, i)
        {
          return {
            delay: time.toSeconds(action.delay),
            sendEmail: !!action.sendEmail,
            sendSms: !!action.sendSms,
            informAor: !!action.informAor,
            informManager: !!action.informManager,
            informMaster: !!action.informMaster,
            informLeader: !!action.informLeader,
            userWhitelist: serializeUsers(view.$($actions[i]).find('[name$="userWhitelist"]')),
            userBlacklist: serializeUsers(view.$($actions[i]).find('[name$="userBlacklist"]'))
          };
        });

      formData.userWhitelist = serializeUsers(view.$id('userWhitelist'));
      formData.userBlacklist = serializeUsers(view.$id('userBlacklist'));

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      _.forEach(ProdDowntimeAlert.CONDITION_TYPES, this.setUpConditionSelect2.bind(this));

      this.setUpActionsSelect2();
      this.onConditionsChange();
      this.onActionsChange();

      setUpUserSelect2(this.$id('userWhitelist'), {
        view: this,
        multiple: true,
        textFormatter: formatUserSelect2Text
      });
      setUpUserSelect2(this.$id('userBlacklist'), {
        view: this,
        multiple: true,
        textFormatter: formatUserSelect2Text
      });
    },

    setUpConditionSelect2: function(type)
    {
      this.$id('conditions-' + type).select2({
        multiple: true,
        data: conditionData[type](this)
      });
    },

    setUpActionsSelect2: function()
    {
      var view = this;
      var actions = view.model.get('actions');

      if (_.isEmpty(actions))
      {
        return;
      }

      var $actions = view.$('.prodDowntimeAlerts-form-action');

      _.forEach(actions, function(action, i)
      {
        view.setUpActionSelect2(view.$($actions[i]), action);
      });

      this.actionCounter = $actions.length;
    },

    setUpActionSelect2: function($action, action)
    {
      var $userWhitelist = setUpUserSelect2($action.find('input[name$="userWhitelist"]'), {
        multiple: true,
        textFormatter: formatUserSelect2Text
      });
      var $userBlacklist = setUpUserSelect2($action.find('input[name$="userBlacklist"]'), {
        multiple: true,
        textFormatter: formatUserSelect2Text
      });

      if (!action)
      {
        return;
      }

      $userWhitelist.select2('data', _.map(action.userWhitelist, function(d)
      {
        return {
          id: d.id,
          text: d.label
        };
      }));
      $userBlacklist.select2('data', _.map(action.userBlacklist, function(d)
      {
        return {
          id: d.id,
          text: d.label
        };
      }));
    },

    onConditionsChange: function()
    {
      this.toggleConditionsValidity();
      this.toggleEmptyConditionsMessage();
    },

    hasAnyValidConditions: function()
    {
      return _.some(
        ProdDowntimeAlert.CONDITION_TYPES,
        function(conditionType) { return this.$id('conditions-' + conditionType).val() !== ''; },
        this
      );
    },

    hasAnyAddedConditions: function()
    {
      return this.$id('conditionTypes').children().filter('[disabled]').length > 1;
    },

    toggleConditionsValidity: function()
    {
      this.$id('conditionTypes')[0].setCustomValidity(
        this.hasAnyValidConditions() ? '' : t('prodDowntimeAlerts', 'FORM:ERROR:conditions')
      );
    },

    toggleEmptyConditionsMessage: function()
    {
      this.$id('conditions-empty').toggleClass('hidden', this.hasAnyAddedConditions());
    },

    onActionsChange: function()
    {
      this.toggleActionsValidity();
      this.toggleEmptyActionsMessage();
      this.recountActions();
    },

    hasAnyValidActions: function()
    {
      var hasAnyUserWhitelisted = !!this.$id('userWhitelist').val().length;

      return _.some(
        this.$('.prodDowntimeAlerts-form-action'),
        function(actionEl)
        {
          var $action = $(actionEl);

          if ($action.attr('data-delay') === '0')
          {
            return false;
          }

          var sendEmail = $action.find('[name$="sendEmail"]').prop('checked');
          var sendSms = $action.find('[name$="sendSms"]').prop('checked');

          if (!sendEmail && !sendSms)
          {
            return false;
          }

          if (hasAnyUserWhitelisted || $action.find('[name$="userWhitelist"]').val().length)
          {
            return true;
          }

          return $action.find('[name$="informAor"]').prop('checked')
            || $action.find('[name$="informManager"]').prop('checked')
            || $action.find('[name$="informMaster"]').prop('checked')
            || $action.find('[name$="informLeader"]').prop('checked');
        },
        this
      );
    },

    hasAnyAddedActions: function()
    {
      return this.$('.prodDowntimeAlerts-form-action').length > 0;
    },

    toggleActionsValidity: function()
    {
      var $validity = this.$id('actions-validity');
      var $add = this.$id('actions-add');

      $validity.css({
        width: $add.outerWidth() + 'px',
        height: $add.outerHeight() + 'px'
      });

      $validity[0].setCustomValidity(
        this.hasAnyValidActions() ? '' : t('prodDowntimeAlerts', 'FORM:ERROR:actions')
      );
    },

    toggleEmptyActionsMessage: function()
    {
      this.$id('actions-empty').toggleClass('hidden', this.hasAnyAddedActions());
    },

    recountActions: function()
    {
      this.$('.prodDowntimeAlerts-form-action-no').each(function(i, el)
      {
        el.innerText = (i + 1) + '.';
      });
    },

    sortActions: function()
    {
      var activeEl = document.activeElement;

      this.$('.prodDowntimeAlerts-form-action')
        .sort(function(a, b) { return a.dataset.delay - b.dataset.delay;})
        .appendTo(this.$id('actions'));

      activeEl.focus();
    }

  });
});
