// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../time","../core/Model"],function(t,e,n,r){"use strict";function i(e){if(!e)return"";if(!e.text.replace(/[^A-Za-z0-9]+/g,"").length)return"";var n=t.escape(e.text.trim()),r=o[e.source];return r&&(n='<i class="fa '+r+'"></i> '+n),n}var o={ps:"fa-paint-brush",wh:"fa-truck"};return r.extend({getActualOrderData:function(){return this.pick(["quantityTodo","quantityDone","statuses"])},getCommentWithIcon:function(){return i(t.last(this.get("comments")))},getDropZone:function(){var r=this.get("whDropZone"),i=this.get("whTime");return t.isEmpty(r)?"":e("planning","orders:dropZone",{group:t.escape(r),time:n.utc.format(i,"HH:mm")})}},{formatCommentWithIcon:i})});