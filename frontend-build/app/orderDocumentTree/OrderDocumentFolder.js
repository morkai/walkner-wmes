define(["underscore","../core/Model"],function(t,e){"use strict";return e.extend({urlRoot:"/orderDocuments/folders",labelAttribute:"name",getLabel:function(){return(this.get("name")||"").replace(/_/g," ")},isRoot:function(){return!this.get("parent")},isInTrash:function(){return"__TRASH__"===this.get("parent")},hasAnyChildren:function(){return!!this.attributes.children&&this.attributes.children.length>0},addChildFolder:function(t){this.set("children",this.get("children").concat(t.id))},removeChildFolder:function(e){this.set("children",t.without(this.get("children"),e.id))}})});