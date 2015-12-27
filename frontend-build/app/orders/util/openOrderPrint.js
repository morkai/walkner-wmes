// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";return function(t,e){if(t&&(t.ctrlKey||1===t.button))return!0;var i="FORM"===e.tagName?e.getAttribute("action"):e.getAttribute("href"),o="WMES_ORDER_PRINTING",r=window.screen,a=.7*r.availWidth,n=.8*r.availHeight,l=Math.floor((r.availWidth-a)/2),h=Math.floor((r.availHeight-n)/2),f="resizable,scrollbars,location=no,top="+h+",left="+l+",width="+Math.floor(a)+",height="+Math.floor(n);return!window.open(i,o,f)}});