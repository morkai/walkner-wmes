define(["../i18n","../core/Model","app/core/util/colorLabel"],function(e,t,r){"use strict";return t.extend({urlRoot:"/prodTasks",clientUrlRoot:"#prodTasks",topicPrefix:"prodTasks",privilegePrefix:"DICTIONARIES",nlsDomain:"prodTasks",labelAttribute:"name",defaults:{name:null,tags:null,fteDiv:!1,inProd:!0,clipColor:"#eeee00",parent:null},url:function(){var e=t.prototype.url.apply(this,arguments);return this.isNew()?e:e+"?populate(parent)"},parse:function(e){return Array.isArray(e.tags)||(e.tags=[]),e.clipColor||(e.clipColor="#eeee00"),e},serialize:function(){var t=this.toJSON();t.tags=t.tags.length?t.tags.join(", "):"-",t.fteDiv=e("core","BOOL:"+!!t.fteDiv),t.inProd=e("core","BOOL:"+!!t.inProd),t.clipColor&&(t.clipColor=r(t.clipColor));var o=this.collection?this.collection.get(t.parent):null;return"string"==typeof t.parent?(o=this.collection?this.collection.get(t.parent):null)&&(t.parent=o.getLabel()):t.parent&&(t.parent=t.parent.name),t.parent||(t.parent=""),t}})});