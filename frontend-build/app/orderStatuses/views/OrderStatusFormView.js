// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/FormView","app/core/templates/colorPicker","app/orderStatuses/templates/form","bootstrap-colorpicker"],function(e,o,r,t){"use strict";return o.extend({template:t,events:e.extend({},o.prototype.events,{"change [name=color]":function(e){e.originalEvent&&this.$colorPicker.colorpicker("setValue",e.target.value)}}),$colorPicker:null,destroy:function(){o.prototype.destroy.call(this),null!==this.$colorPicker&&(this.$colorPicker.colorpicker("destroy"),this.$colorPicker=null)},serialize:function(){return e.extend(o.prototype.serialize.call(this),{renderColorPicker:r})},afterRender:function(){o.prototype.afterRender.call(this),this.$colorPicker=this.$(".colorpicker-component").colorpicker(),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus())}})});