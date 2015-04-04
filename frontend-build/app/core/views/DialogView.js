// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../View"],function(i,e){"use strict";return e.extend({events:{"click .dialog-answer":function(e){var t=this.$(e.target).closest(".dialog-answer");if(!t.prop("disabled")){t.prop("disabled",!0);var n=t.attr("data-answer");i.isString(n)&&n.length>0&&(this.trigger("answered",n),i.isFunction(this.closeDialog)&&this.closeDialog())}}},serialize:function(){return this.model},onDialogShown:function(i){this.closeDialog=this.options.autoHide===!1?function(){}:i.closeDialog.bind(i)}})});