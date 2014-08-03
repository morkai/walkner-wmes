//
// reltime.js - a light weight library for parsing relative time
// based on days, hours, minutes and seconds using a simple
// a simple time notaion (e.g. 1d 2h 3m 5s would be one day, two
// hours, three minutes  and five seconds to some relative date.)
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

//
// parse() - parse a simple relative notation and return
// a new date object reflecting the new time.
// Example: var new_time = reltime.parse(new Date(), "1d 2h 3m 4s");
//
// These are the tokens that delimit the denomination being calculated:
//
//                d, day, days - relative +/- day(s)
//                h, hour, hours - relative +/- hour(s)
//                m, minute, minutes - relative +/- minutes
//                s, second, seconds - relative +/- seconds
//
// Each delimiter can be processed by a positive or negative number.
// Values are converted to Unix style timestamp, combined then returned
// as an updated data object. If their is a problem in the parse then
// false is returned.
//
// @param date_object - this is a native JavaScript date object
// @param time_notation - A string in the simple relative time notation
// @return a JavaScript Date object of false if something goes wrong.
//
(function (global) {
  var parse = function (date_object, time_notation) {
    /* toks maps units to milliseconds scaling value */
    var toks = {
        /* 24*60*60*1000 */
        d: 86400000,
        dy: 86400000,
        day: 86400000,
        days: 86400000,
        /* 60*60*1000 */
        h: 3600000,
        hr: 3600000,
        hour: 3600000,
        hours: 3600000,
        /* 60*1000 */
        m: 60000,
        min: 60000,
        minute: 60000,
        minutes: 60000,
        /* 1000 */
        s: 1000,
        sec: 1000,
        secs: 1000,
        second: 1000,
        seconds: 1000
      },
      result = date_object.valueOf(),
      tokens = time_notation.toLowerCase().split(" "),
      val = 0,
      scale = 1,
      tok,
      i = 0,
      j = 0,
      cur = -1;

    for (i = 0; i < tokens.length; i += 1) {
      tok = false;
      if (Number(tokens[i])) {
        val = tokens[i];
      } else {
        cur = tokens[i].match(/[a-z]/);
        if (cur) {
          j = cur.index;
          tok = tokens[i].substr(j);
          if (j > 0) {
            val = tokens[i].substr(0, j);
          }
        } else {
          tok = tokens[i];
        }

        if (tok && val) {
          scale = toks[tok];
          result += val * scale;
          val = 0;
          tok = false;
        }
      }
    }
    return new Date(result);
  };

  global.reltime = {
    parse: parse
  };

  if (typeof exports !== 'undefined') {
    exports.parse = parse;
  }

  return global;
}(this));
