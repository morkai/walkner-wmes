// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../core/Collection","./OrderDocumentFolder"],function(e,t){"use strict";return e.extend({model:t,rqlQuery:"sort(name)",handleFolderAdded:function(e){if(!this.get(e.id)){this.add(e);var t=this.get(e.get("parent"));t&&t.addChildFolder(e)}},handleFolderPurged:function(e){var t=this.get(e);if(t){this.remove(t);var r=this.get(t.get("parent"));r&&r.removeChildFolder(t)}},handleFolderRemoved:function(e){var t=this.get(e);if(t&&"__TRASH__"!==t.get("parent")){t.set({parent:"__TRASH__",oldParent:t.get("parent")});var r=this.get(t.get("oldParent"));r&&r.removeChildFolder(t)}},handleFolderMoved:function(e,t){var r=this.get(e);if(r){var d=r.get("parent"),n=this.get(d),o=this.get(t);r.set({parent:t,oldParent:null},{oldParentId:d}),n&&n.removeChildFolder(r),o&&o.addChildFolder(r)}},handleFolderRenamed:function(e,t){var r=this.get(e);r&&r.set("name",t)},handleFolderRecovered:function(e){var t=this.get(e);t&&t.isInTrash()&&t.set({parent:this.get("oldParent"),oldParent:null})}})});