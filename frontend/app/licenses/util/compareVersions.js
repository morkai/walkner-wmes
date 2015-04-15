// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([

], function(

) {
  'use strict';

  var PRS = {
    alpha: 1,
    beta: 2,
    rc: 3
  };

  return function compareVersions(v1, v2)
  {
    if (v1 === v2)
    {
      return 0;
    }

    var re = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([a-z]+)(?:\.?([0-9]+))?)?$/;
    var v1Matches = v1.match(re);
    var v2Matches = v2.match(re);

    if (!v1Matches || !v2Matches)
    {
      return 0;
    }

    var v1Major = +v1Matches[1];
    var v2Major = +v2Matches[1];

    if (v1Major < v2Major)
    {
      return -1;
    }
    else if (v1Major > v2Major)
    {
      return 1;
    }

    var v1Minor = +v1Matches[2];
    var v2Minor = +v2Matches[2];

    if (v1Minor < v2Minor)
    {
      return -1;
    }
    else if (v1Minor > v2Minor)
    {
      return 1;
    }

    var v1Patch = +v1Matches[3];
    var v2Patch = +v2Matches[3];

    if (v1Patch < v2Patch)
    {
      return -1;
    }
    else if (v1Patch > v2Patch)
    {
      return 1;
    }

    var v1Pr = PRS[v1Matches[4]];
    var v2Pr = PRS[v2Matches[4]];

    if (!v1Pr)
    {
      if (v2Pr)
      {
        return 1;
      }

      return 0;
    }

    if (!v2Pr)
    {
      if (v1Pr)
      {
        return -1;
      }

      return 0;
    }

    if (v1Pr !== v2Pr)
    {
      return v1Pr - v2Pr;
    }

    var v1PrN = +v1Matches[5] || 1;
    var v2PrN = +v2Matches[5] || 1;

    return v1PrN - v2PrN;
  };
});
