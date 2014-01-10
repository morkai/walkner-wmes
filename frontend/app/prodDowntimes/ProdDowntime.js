define([
  '../time',
  '../core/Model',
  '../production/util/getShiftEndDate'
], function(
  time,
  Model,
  getShiftEndDate
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
      mechOrder: null,
      orderId: null,
      operationNo: null
    },

    sync: function(method)
    {
      if (method === 'read')
      {
        return Model.prototype.sync.apply(this, arguments);
      }

      throw new Error("Method not supported: " + method);
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

      var finishedAt = time.getServerMoment().toDate();
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
    }

  }, {

    STATUS: {
      UNDECIDED: 'undecided',
      CONFIRMED: 'confirmed',
      REJECTED: 'rejected'
    }

  });

});
