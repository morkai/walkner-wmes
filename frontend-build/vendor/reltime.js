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

!function(e){var t=function(e,t){var n,r={d:864e5,dy:864e5,day:864e5,days:864e5,h:36e5,hr:36e5,hour:36e5,hours:36e5,m:6e4,min:6e4,minute:6e4,minutes:6e4,s:1e3,sec:1e3,secs:1e3,second:1e3,seconds:1e3},i=e.valueOf(),o=t.toLowerCase().split(" "),a=0,s=1,l=0,u=0,c=-1;for(l=0;l<o.length;l+=1)n=!1,Number(o[l])?a=o[l]:(c=o[l].match(/[a-z]/),c?(u=c.index,n=o[l].substr(u),u>0&&(a=o[l].substr(0,u))):n=o[l],n&&a&&(s=r[n],i+=a*s,a=0,n=!1));return new Date(i)};return e.reltime={parse:t},"undefined"!=typeof exports&&(exports.parse=t),e}(this);