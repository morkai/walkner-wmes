// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/FormView","app/divisions/templates/form"],function(e,i,t){return i.extend({template:t,idPrefix:"divisionForm",afterRender:function(){i.prototype.afterRender.call(this),this.options.editMode&&this.$id("_id").attr("disabled",!0)}})});