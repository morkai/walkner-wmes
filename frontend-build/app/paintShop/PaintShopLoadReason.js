define(["../i18n","../core/Model"],function(e,t){"use strict";return t.extend({urlRoot:"/paintShop/load/reasons",clientUrlRoot:"#paintShop/load/reasons",privilegePrefix:"PAINT_SHOP",nlsDomain:"paintShop",labelAttribute:"label",serialize:function(){var t=this.toJSON();return t.active=e("core","BOOL:"+t.active),t}})});