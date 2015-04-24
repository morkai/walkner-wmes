// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/data/subdivisions'
], function(
  _,
  downtimeReasons,
  aors,
  subdivisions
) {
  'use strict';

  return {
    initialize: function(view)
    {
      view.reasonsToAorsMap = {};
      view.reasonsList = [];
      view.aorsList = {};
    },
    destroy: function(view)
    {
      view.reasonsToAorsMap = null;
      view.reasonsList = null;
      view.aorsList = null;
    },
    setUpReasons: function(view, customReasons, subdivisionId)
    {
      var reasonsToAorsMap = {};
      var reasonsList = [];
      var subdivision = subdivisions.get(subdivisionId);
      var defaultAor = subdivision ? subdivision.get('aor') : null;

      (customReasons || downtimeReasons).forEach(function(reason)
      {
        var reasonAors = {};
        var hasAnyAors = false;

        if (reason.get('defaultAor') && defaultAor)
        {
          reasonAors[defaultAor] = true;
          hasAnyAors = true;
        }
        else
        {
          _.forEach(reason.get('aors'), function(aor)
          {
            reasonAors[aor] = true;
            hasAnyAors = true;
          });
        }

        if (!hasAnyAors)
        {
          reasonAors = null;
        }

        reasonsToAorsMap[reason.id] = reasonAors;
        reasonsList.push({
          id: reason.id,
          text: reason.id + ' - ' + reason.get('label'),
          aors: reasonAors
        });
      });

      view.reasonsToAorsMap = reasonsToAorsMap;
      view.reasonsList = reasonsList;
    },
    setUpAors: function(view)
    {
      var aorsList = [];

      aors.forEach(function(aor)
      {
        aorsList.push({
          id: aor.id,
          text: aor.get('name')
        });
      });

      view.aorsList = aorsList;
    },
    getReasonsForAor: function(view, aor)
    {
      if (!aor)
      {
        return view.reasonsList;
      }

      var reasonsForAor = [];

      for (var i = 0; i < view.reasonsList.length; ++i)
      {
        var reason = view.reasonsList[i];

        if (!reason.aors || reason.aors[aor])
        {
          reasonsForAor.push(reason);
        }
      }

      return reasonsForAor;
    },
    getAorsForReason: function(view, reason)
    {
      if (!reason)
      {
        return view.aorsList;
      }

      var aorsMap = view.reasonsToAorsMap[reason];

      if (aorsMap === undefined)
      {
        return [];
      }

      if (aorsMap === null)
      {
        return view.aorsList;
      }

      var reasonAors = [];

      _.forEach(Object.keys(aorsMap), function(aorId)
      {
        reasonAors.push({
          id: aorId,
          text: aors.get(aorId).get('name')
        });
      });

      return reasonAors;
    },
    setUpReasonSelect2: function(view, aor, options)
    {
      var $reason = view.$id('reason');
      var data = this.getReasonsForAor(view, aor);

      $reason.select2(_.extend({
        openOnEnter: null,
        data: data
      }, options));

      if ($reason.select2('data') === null)
      {
        $reason.select2('val', data.length === 1 ? data[0].id : '');
      }
    },
    setUpAorSelect2: function(view, reason, options)
    {
      var $aor = view.$id('aor');
      var data = this.getAorsForReason(view, reason);

      $aor.select2(_.extend({
        openOnEnter: null,
        data: data
      }, options));

      if ($aor.select2('data') === null)
      {
        $aor.select2('val', data.length === 1 ? data[0].id : '');
      }
    }
  };
});
