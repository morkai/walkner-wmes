// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FormView","app/feedback/templates/form"],function(e,t){return e.extend({template:t,events:{submit:"submitForm","blur textarea":function(e){e.currentTarget.value=e.currentTarget.value.trim()}},serializeForm:function(e){return e.createdAt=new Date,e},destroy:function(){e.prototype.destroy.call(this),"function"==typeof this.options.done&&this.options.done(!1)}})});