// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([],function(){"use strict";return{toggle:function(e){e.find("input:checked").parent().addClass("active")},getValue:function(e){var t=e.find("input");return"radio"===t[0].type||1===t.length?t.filter(":checked").val():t.filter(":checked").map(function(){return this.value}).get()}}});