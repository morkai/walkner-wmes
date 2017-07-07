// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user'
], function(
  _,
  $,
  user
) {
  'use strict';

  var ownMrps = null;

  function getAsSelect2()
  {
    return (ownMrps || []).map(function(mrp)
    {
      return {
        id: mrp,
        text: mrp
      };
    });
  }

  return {
    hasAny: function()
    {
      return ownMrps && ownMrps.length > 0;
    },
    getAsList: function()
    {
      return [].concat(ownMrps || []);
    },
    getAsSelect2: getAsSelect2,
    load: function(view, force)
    {
      if (!force && ownMrps !== null)
      {
        return $.Deferred().resolve().promise();
      }

      return view.ajax({url: '/mor/iptCheck'}).done(function(res)
      {
        ownMrps = [];

        _.forEach(res.mrpToRecipients, function(recipients, mrp)
        {
          if (_.includes(recipients, user.data._id))
          {
            ownMrps.push(mrp);
          }
        });
      });
    },
    events: {
      'click #-ownMrps': function(e)
      {
        this.$(e.target).closest('label').next().select2('data', getAsSelect2());

        return false;
      }
    }
  };
});
