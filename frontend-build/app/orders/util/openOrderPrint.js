// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/core/util/html2pdf"],function(t,n){"use strict";return function(e){t.ajax({url:"/orders/"+e.join("+")+".html",dataType:"html"}).done(function(t){n(t)})}});