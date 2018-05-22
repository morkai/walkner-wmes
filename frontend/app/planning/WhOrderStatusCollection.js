// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Collection',
  './WhOrderStatus'
], function(
  _,
  t,
  time,
  Collection,
  WhOrderStatus
) {
  'use strict';

  function parse(status)
  {
    var id = status._id;

    status.orderNo = id.orderNo;
    status.groupNo = id.groupNo;
    status.line = id.line;
    status._id = status.orderNo + ':' + status.groupNo + ':' + status.line;

    return status;
  }

  return Collection.extend({

    model: WhOrderStatus,

    paginate: false,

    initialize: function(models, options)
    {
      options = _.assign({
        date: time.utc.getMoment(Date.now())
          .startOf('day')
          .subtract(time.getMoment().hours() < 6 ? 1 : 0, 'days')
          .format('YYYY-MM-DD')
      }, options);

      this.date = options.date;
    },

    url: function()
    {
      return '/planning/whOrderStatuses?_id.date=' + time.utc.getMoment(this.date, 'YYYY-MM-DD').valueOf();
    },

    parse: function(res)
    {
      return (res.collection || []).map(parse);
    },

    setUpPubsub: function(pubsub)
    {
      var whOrderStatuses = this;

      pubsub.subscribe('planning.whOrderStatuses.updated', function(message)
      {
        whOrderStatuses.update(message);
      });
    },

    update: function(data)
    {
      if (time.utc.format(data._id.date, 'YYYY-MM-DD') !== this.date)
      {
        return;
      }

      data = parse(data);

      var status = this.get(data._id);

      if (status)
      {
        status.set(data);
      }
      else
      {
        this.add(data);
      }
    },

    serialize: function(orderKey)
    {
      var status = this.get(orderKey);

      if (!status)
      {
        return {
          status: 0,
          label: t('planning', 'wh:status:0', {qtySent: 0})
        };
      }

      return status.serialize();
    }

  });
});
