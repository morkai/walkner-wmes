// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../time',
  '../user',
  '../core/Model',
  '../core/util/getShiftEndDate',
  './util/decorateProdDowntime'
], function(
  time,
  user,
  Model,
  getShiftEndDate,
  decorateProdDowntime
) {
  'use strict';

  var STATUS_TO_CSS_CLASS_NAME = {
    undecided: 'warning',
    confirmed: 'success',
    rejected: 'danger',
    null: 'primary'
  };

  return Model.extend({

    urlRoot: '/prodDowntimes',

    clientUrlRoot: '#prodDowntimes',

    topicPrefix: 'prodDowntimes',

    privilegePrefix: 'PROD_DOWNTIMES',

    nlsDomain: 'prodDowntimes',

    labelAttribute: 'rid',

    defaults: {
      division: null,
      subdivision: null,
      mrpControllers: null,
      prodFlow: null,
      workCenter: null,
      prodLine: null,
      prodShift: null,
      prodShiftOrder: null,
      date: null,
      shift: null,
      aor: null,
      reason: null,
      reasonComment: null,
      decisionComment: null,
      status: null,
      startedAt: null,
      finishedAt: null,
      corroborator: null,
      corroboratedAt: null,
      creator: null,
      master: null,
      leader: null,
      operator: null,
      operators: null,
      mechOrder: null,
      orderId: null,
      operationNo: null
    },

    serializeRow: function(currentTime)
    {
      return decorateProdDowntime(this, {changesCount: true, currentTime: currentTime});
    },

    serializeDetails: function()
    {
      return decorateProdDowntime(this, {longDate: true});
    },

    getCssClassName: function(status)
    {
      return STATUS_TO_CSS_CLASS_NAME[status === undefined ? this.get('status') : status];
    },

    finish: function()
    {
      if (this.get('finishedAt') != null)
      {
        return null;
      }

      var finishedAt = time.getMoment().toDate();
      var shiftEndDate = getShiftEndDate(this.get('date'), this.get('shift'));

      if (finishedAt > shiftEndDate)
      {
        finishedAt = shiftEndDate;
      }

      this.set('finishedAt', finishedAt);

      return {
        _id: this.id,
        finishedAt: finishedAt
      };
    },

    isEditable: function()
    {
      return this.get('finishedAt') != null && this.get('pressWorksheet') === null;
    },

    canCorroborate: function()
    {
      return user.isLoggedIn() && this.get('pressWorksheet') === null;
    },

    /**
     * @param {object} options
     * @param {function(string): boolean} options.hasAccessToAor
     * @param {boolean} options.canManageProdData
     * @param {boolean} options.canManageProdDowntimes
     * @param {number} options.maxRejectedChanges
     * @param {number} options.maxReasonChanges
     * @param {number} options.maxAorChanges
     * @returns {number}
     */
    canChangeStatus: function(options)
    {
      if (!this.get('finishedAt'))
      {
        return 0;
      }

      if (options.canManageProdData)
      {
        return 2;
      }

      var status = this.get('status');

      if (!options.canManageProdDowntimes || status === 'confirmed')
      {
        return 0;
      }

      var changesCount = this.get('changesCount');

      if (!changesCount
        || changesCount.rejected >= options.maxRejectedChanges
        || changesCount.reason >= options.maxReasonChanges
        || changesCount.aor >= options.maxAorChanges)
      {
        return 0;
      }

      return options.hasAccessToAor(this.get('aor')) ? 1 : 0;
    },

    getDurationString: function(currentTime)
    {
      var startTime = Date.parse(this.get('startedAt'));
      var endTime = Date.parse(this.get('finishedAt')) || currentTime || Date.now();

      return time.toString(Math.round((endTime - startTime) / 1000));
    }

  }, {

    STATUS: {
      UNDECIDED: 'undecided',
      CONFIRMED: 'confirmed',
      REJECTED: 'rejected'
    },

    parse: function(data)
    {
      ['date', 'startedAt', 'finishedAt', 'createdAt', 'corroboratedAt'].forEach(function(dateProperty)
      {
        if (typeof data[dateProperty] === 'string')
        {
          data[dateProperty] = new Date(data[dateProperty]);
        }
      });

      return data;
    }

  });

});
