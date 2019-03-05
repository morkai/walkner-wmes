// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
    reasons: downtimeReasons,
    aors: aors,
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
      var reasons = customReasons;

      if (!reasons)
      {
        if (subdivision)
        {
          reasons = downtimeReasons.findBySubdivisionType(subdivision.get('type'));
        }
        else
        {
          reasons = downtimeReasons;
        }
      }

      reasons.forEach(function(reason)
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
          reason: reason,
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
          text: aor.get('name'),
          aor: aor
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
        var aor = aors.get(aorId);

        reasonAors.push({
          id: aorId,
          text: aor.get('name'),
          aor: aor
        });
      });

      return reasonAors;
    },
    setUpReasonSelect2: function(view, aor, options)
    {
      var $reason = view.$id('reason');
      var data = this.getReasonsForAor(view, aor);

      $reason.select2(_.assign({
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

      $aor.select2(_.assign({
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
