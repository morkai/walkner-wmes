// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../time',
  '../user',
  '../core/Model',
  '../core/util/getShiftEndDate',
  '../data/aors',
  '../data/downtimeReasons',
  './util/decorateProdDowntime'
], function(
  time,
  user,
  Model,
  getShiftEndDate,
  aors,
  downtimeReasons,
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

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(prodShiftOrder)';
    },

    serializeRow: function(currentTime)
    {
      return decorateProdDowntime(this, {changesCount: true, currentTime: currentTime});
    },

    serializeDetails: function()
    {
      return decorateProdDowntime(this, {longDate: true});
    },

    getReasonLabel: function()
    {
      var reasonId = this.get('reason');
      var reason = downtimeReasons.get(reasonId);

      return reason ? reason.get('label') : reasonId;
    },

    getAorLabel: function()
    {
      var aorId = this.get('aor');
      var aor = aors.get(aorId);

      return aor ? aor.get('name') : aorId;
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
     * @param {Object} options
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

    getDuration: function(currentTime)
    {
      var startTime = Date.parse(this.get('startedAt'));
      var endTime = Date.parse(this.get('finishedAt')) || currentTime || Date.now();

      return endTime - startTime;
    },

    getDurationString: function(currentTime, compact)
    {
      var duration = this.getDuration(currentTime);

      return time.toString(Math.round(duration / 1000), compact);
    },

    isBreak: function()
    {
      var reason = downtimeReasons.get(this.get('reason'));

      return reason && reason.get('type') === 'break';
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
