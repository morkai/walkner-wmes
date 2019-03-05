// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/View',
  'app/core/util/onModelDeleted',
  'app/fte/templates/leaderEntry',
  '../util/fractions'
], function(
  _,
  $,
  View,
  onModelDeleted,
  leaderEntryTemplate,
  fractionsUtil
) {
  'use strict';

  return View.extend({

    template: leaderEntryTemplate,

    remoteTopics: function()
    {
      var topics = {};

      topics['fte.leader.updated.' + this.model.id] = 'onModelUpdated';
      topics['fte.leader.deleted'] = 'onModelDeleted';

      return topics;
    },

    events: {
      'click .fte-count-container': function(e)
      {
        this.showCountEditor(this.$(e.currentTarget).attr('data-key'));
      },
      'blur #-countEditor': function()
      {
        this.saveCountEdit();
      },
      'keydown #-countEditor': function(e)
      {
        if (e.keyCode === 13)
        {
          this.$id('countEditor').blur();
        }
        else if (e.keyCode === 27)
        {
          this.hideCountEditor();
        }
      }
    },

    initialize: function()
    {
      this.scheduleModelReload = _.throttle(this.model.fetch.bind(this.model), 3000, true);
      this.changing = false;
      this.changeKey = null;
      this.pendingChanges = {};
    },

    serialize: function()
    {
      return _.assign(this.model.serializeWithTotals(), {
        idPrefix: this.idPrefix,
        editable: false,
        withFunctions: this.model.isWithFunctions(),
        round: fractionsUtil.round
      });
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change', this.render);

      _.forEach(this.pendingChanges, function(change, key) { this.renderPendingChange(key); }, this);
    },

    onModelUpdated: function()
    {
      this.scheduleModelReload();
    },

    onModelDeleted: function(message)
    {
      onModelDeleted(this.broker, this.model, message);
    },

    toggleCountEditing: function(state)
    {
      var comment = this.$id('comment').val();
      var pendingChanges = this.pendingChanges;

      this.pendingChanges = {};
      this.changing = state;

      this.render();

      if (state)
      {
        this.$id('comment').focus();
      }

      return {
        comment: comment,
        changes: _.values(pendingChanges)
      };
    },

    showCountEditor: function(key)
    {
      if (!this.changing)
      {
        return;
      }

      this.hideCountEditor();

      this.changeKey = key;

      var change = this.pendingChanges[key];
      var oldValue = this.getCountByKey(key);
      var $countEditor = $('<input>').attr({
        id: this.idPrefix + '-countEditor',
        class: 'form-control no-controls fte-count-editor',
        type: 'number',
        min: 0,
        max: 9999,
        value: change ? change.newValue : oldValue,
        'data-old-value': oldValue
      });

      $countEditor
        .appendTo(this.$id('entryPanel'))
        .select();

      this.positionCountEditor();
    },

    positionCountEditor: function($countContainer)
    {
      if (!$countContainer)
      {
        $countContainer = this.getCountContainerByKey(this.changeKey);
      }

      var position = $countContainer.position();

      this.$id('countEditor').css({
        position: 'absolute',
        top: position.top + 'px',
        left: position.left + 'px',
        width: ($countContainer.outerWidth() + 1) + 'px',
        height: ($countContainer.outerHeight() + 1) + 'px'
      });
    },

    hideCountEditor: function()
    {
      this.$id('countEditor').remove();

      this.changeKey = null;
    },

    getCountContainerByKey: function(changeKey)
    {
      return this.$('.fte-count-container[data-key="' + changeKey + '"]');
    },

    getCountByKey: function(changeKey)
    {
      var indexes = changeKey.split(':');

      if (indexes[0] === 'demand')
      {
        return this.model.get('totals').demand[indexes[1]];
      }

      var taskIndex = +indexes[0];
      var functionIndex = +indexes[1];
      var companyIndex = +indexes[2];
      var divisionIndex = indexes.length === 4 ? +indexes[3] : -1;
      var tasks = this.model.get('tasks') || [];
      var task = tasks[taskIndex];

      if (!task)
      {
        return 0;
      }

      var func = task.functions[functionIndex];

      if (!func)
      {
        return 0;
      }

      var company = func.companies[companyIndex];

      if (!company)
      {
        return 0;
      }

      if (divisionIndex === -1)
      {
        return company.count;
      }

      var division = company.count[divisionIndex];

      if (!division)
      {
        return 0;
      }

      return division.value;
    },

    saveCountEdit: function()
    {
      delete this.pendingChanges[this.changeKey];

      var $countEditor = this.$id('countEditor');
      var oldValue = +$countEditor.attr('data-old-value');
      var newValue = +$countEditor.val();

      if (isNaN(newValue) || newValue < 0)
      {
        newValue = 0;
      }

      if (newValue !== oldValue)
      {
        this.pendingChanges[this.changeKey] = this.createPendingChange(oldValue, newValue);
      }

      this.renderPendingChange(this.changeKey);
      this.hideCountEditor();
    },

    createPendingChange: function(oldValue, newValue)
    {
      var indexes = this.changeKey.split(':');

      if (indexes[0] === 'demand')
      {
        return this.createPendingDemandChange(oldValue, newValue, indexes[1]);
      }

      return this.createPendingSupplyChange(oldValue, newValue, indexes);
    },

    createPendingDemandChange: function(oldValue, newValue, companyId)
    {
      return {
        kind: 'demand',
        companyId: companyId,
        oldValue: oldValue,
        newValue: newValue
      };
    },

    createPendingSupplyChange: function(oldValue, newValue, indexes)
    {
      var taskIndex = +indexes[0];
      var functionIndex = +indexes[1];
      var companyIndex = +indexes[2];
      var divisionIndex = indexes.length === 4 ? +indexes[3] : -1;
      var tasks = this.model.get('tasks');
      var task = tasks[taskIndex];
      var func = task.functions[functionIndex];
      var company = func.companies[companyIndex];
      var division = divisionIndex === -1 ? null : company.count[divisionIndex];

      return {
        kind: 'supply',
        taskIndex: taskIndex,
        taskId: task.id,
        taskName: task.name,
        functionIndex: functionIndex,
        functionId: func.id,
        companyIndex: companyIndex,
        companyId: company.id,
        divisionIndex: divisionIndex,
        divisionId: division ? division.division : null,
        oldValue: oldValue,
        newValue: newValue
      };
    },

    renderPendingChange: function(changeKey)
    {
      var $countContainer = this.getCountContainerByKey(changeKey);
      var $count = $countContainer.find('.fte-count');
      var change = this.pendingChanges[changeKey];
      var html = '?';

      if (change)
      {
        var oldValue = fractionsUtil.round(change.oldValue);

        html = oldValue
          + ' <i class="fa fa-arrow-right"></i> '
          + fractionsUtil.round(change.newValue);

        $count.addClass('is-changed').attr('data-old-value', oldValue);
      }
      else
      {
        html = fractionsUtil.round(this.getCountByKey(changeKey));

        $count.removeClass('is-changed');
      }

      $count.html(html);
    }

  });
});
