// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";var r={alpha:1,beta:2,rc:3};return function(t,n){if(t===n)return 0;var e=/^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([a-z]+)(?:\.?([0-9]+))?)?$/,u=t.match(e),i=n.match(e);if(!u||!i)return 0;var f=+u[1],a=+i[1];if(a>f)return-1;if(f>a)return 1;var v=+u[2],c=+i[2];if(c>v)return-1;if(v>c)return 1;var h=+u[3],m=+i[3];if(m>h)return-1;if(h>m)return 1;var o=r[u[4]],s=r[i[4]];if(!o)return s?1:0;if(!s)return o?-1:0;if(o!==s)return o-s;var b=+u[5]||1,d=+i[5]||1;return b-d}});