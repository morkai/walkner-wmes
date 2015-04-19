// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/colorFactory"],function(r){"use strict";function n(n){var t=r.getColor("LICENSES",n);return'<span class="label license-feature" style="background: '+t+'">'+n+"</span>"}return function(r){for(var t=[],a={},e=0;e<r.length;++e){var o=Math.pow(2,e);t.push(o),a[o]=n(r[e])}return function(r){for(var n=[],e=0;e<t.length;++e){var o=t[e];r&o&&n.push(a[o])}return n.join(" ")}}});