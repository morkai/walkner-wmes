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

!function(e){var s=function(e,s){var r,t={d:864e5,dy:864e5,day:864e5,days:864e5,h:36e5,hr:36e5,hour:36e5,hours:36e5,m:6e4,min:6e4,minute:6e4,minutes:6e4,s:1e3,sec:1e3,secs:1e3,second:1e3,seconds:1e3},n=e.valueOf(),o=s.toLowerCase().split(" "),u=0,a=1,i=0,d=0,c=-1;for(i=0;i<o.length;i+=1)r=!1,Number(o[i])?u=o[i]:(c=o[i].match(/[a-z]/),c?(d=c.index,r=o[i].substr(d),d>0&&(u=o[i].substr(0,d))):r=o[i],r&&u&&(a=t[r],n+=u*a,u=0,r=!1));return new Date(n)};e.reltime={parse:s},"undefined"!=typeof exports&&(exports.parse=s)}(this);