// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";var r={alpha:1,beta:2,rc:3};return function(t,n){if(t===n)return 0;var e=/^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([a-z]+)(?:\.?([0-9]+))?)?$/,u=t.match(e),a=n.match(e);if(!u||!a)return 0;var i=+u[1],f=+a[1];if(i<f)return-1;if(i>f)return 1;var c=+u[2],v=+a[2];if(c<v)return-1;if(c>v)return 1;var h=+u[3],m=+a[3];if(h<m)return-1;if(h>m)return 1;var o=r[u[4]],s=r[a[4]];return o?s?o!==s?o-s:(+u[5]||1)-(+a[5]||1):o?-1:0:s?1:0}});