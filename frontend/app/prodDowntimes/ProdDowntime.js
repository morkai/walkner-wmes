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
    rejected: 'danger'
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

    serializeRow: function()
    {
      return decorateProdDowntime(this);
    },

    serializeDetails: function()
    {
      return decorateProdDowntime(this, {longDate: true});
    },

    getCssClassName: function()
    {
      return STATUS_TO_CSS_CLASS_NAME[this.get('status')];
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
      return this.get('pressWorksheet') === null;
    },

    canChangeStatus: function()
    {
      if (!this.get('finishedAt'))
      {
        return false;
      }

      if (user.isAllowedTo('PROD_DATA:MANAGE'))
      {
        return true;
      }

      if (!user.isAllowedTo('PROD_DOWNTIMES:MANAGE'))
      {
        return false;
      }

      return this.get('status') !== 'confirmed';
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
