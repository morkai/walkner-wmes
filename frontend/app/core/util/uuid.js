/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 *
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
define([

], function(

) {
  'use strict';

  var t = [];

  for (var i = 0; i < 256; ++i)
  {
    t[i] = (i < 16 ? '0' : '') + i.toString(16).toUpperCase();
  }

  return function uuid()
  {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;

    return t[d0 & 0xff] + t[d0 >> 8 & 0xff] + t[d0 >> 16 & 0xff] + t[d0 >> 24 & 0xff] + '-'
      + t[d1 & 0xff] + t[d1 >> 8 & 0xff] + '-' + t[d1 >> 16 & 0x0f | 0x40] + t[d1 >> 24 & 0xff] + '-'
      + t[d2 & 0x3f | 0x80] + t[d2 >> 8 & 0xff] + '-' + t[d2 >> 16 & 0xff] + t[d2 >> 24 & 0xff]
      + t[d3 & 0xff] + t[d3 >> 8 & 0xff] + t[d3 >> 16 & 0xff] + t[d3 >> 24 & 0xff];
  };
});
