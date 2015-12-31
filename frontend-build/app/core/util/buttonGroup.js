// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([],function(){"use strict";return{toggle:function(e){e.find("input:checked").parent().addClass("active")},getValue:function(e){var t=e.find("input");return t.length?"radio"===t[0].type||1===t.length?t.filter(":checked").val():t.filter(":checked").map(function(){return this.value}).get():null}}});