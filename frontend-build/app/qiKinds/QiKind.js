// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../i18n","../core/Model","../data/orgUnits"],function(i,e,n){"use strict";return e.extend({urlRoot:"/qi/kinds",clientUrlRoot:"#qi/kinds",topicPrefix:"qi.kinds",privilegePrefix:"QI:DICTIONARIES",nlsDomain:"qiKinds",labelAttribute:"name",serialize:function(){var e=this.toJSON(),o=n.getByTypeAndId("division",e.division);return e.division=e.division?o?o.getLabel():e.division:i.bound("qiKinds","ordersDivision"),e.order=i("core","BOOL:"+e.order),e}})});