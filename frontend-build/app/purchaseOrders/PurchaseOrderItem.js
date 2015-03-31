// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../user","../core/Model"],function(e,s){return s.extend({defaults:{},serialize:function(){var s=this.toJSON();return s.status=s.completed?"completed":"waiting",s.rowClassName="is-"+s.status,"completed"===s.status?s.schedule=[]:e.isAllowedTo("PURCHASE_ORDERS:MANAGE")&&(s.rowClassName+=" is-selectable"),"completed"!==s.status&&s.printedQty<s.qty&&(s.rowClassName+=" is-inProgress"),s.rowSpan=s.schedule.length,s}})});