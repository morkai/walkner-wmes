// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function parseSapTime(input)
{
  var matches = input.match(/^([0-9]{2}):?([0-9]{2})(?::?([0-9]{2}))?$/);

  return matches === null ? null : {
    h: +matches[1],
    m: +matches[2],
    s: matches[3] === undefined ? 0 : +matches[3]
  };
};
