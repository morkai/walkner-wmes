// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/colorFactory"],function(r){"use strict";function e(e){var t=r.getColor(n,e);return'<span class="label license-feature" style="background: '+t+'">'+e+"</span>"}var n="XICONF_LICENSE",t=[1,2,4,8],a={1:e("wmes"),2:e("sol"),4:e("t24vdc"),8:e("led")};return function(r){for(var e=[],n=0;n<t.length;++n){var o=t[n];r&o&&e.push(a[o])}return e.join(" ")}});