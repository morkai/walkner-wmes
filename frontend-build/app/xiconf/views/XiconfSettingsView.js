define(["underscore","jquery","app/i18n","app/viewport","app/settings/views/SettingsView","app/xiconf/templates/settings"],function(t,e,i,n,o,r){"use strict";return o.extend({clientUrl:"#xiconf;settings",template:r,initialize:function(){o.prototype.initialize.apply(this,arguments);var t=this.handleDragEvent.bind(this);e(document).on("dragenter."+this.idPrefix,t),e(document).on("dragleave."+this.idPrefix,t),e(document).on("dragover."+this.idPrefix,t),e(document).on("drop."+this.idPrefix,this.onDrop.bind(this))},destroy:function(){o.prototype.destroy.apply(this,arguments),e(document).off("."+this.idPrefix)},handleDragEvent:function(t){t.preventDefault(),t.stopPropagation()},onDrop:function(e){if((e=e.originalEvent).preventDefault(),e.stopPropagation(),!e.dataTransfer.files.length)return n.msg.show({type:"warning",time:3e3,text:i("xiconf","MSG:drop:filesOnly")});var o=t.find(e.dataTransfer.files,function(t){return"application/x-zip-compressed"===t.type&&/^[0-9]+\.[0-9x]+\.[0-9x]+\-[0-9]+\.[0-9x]+\.[0-9x]+\.zip$/.test(t.name)});if(!o)return n.msg.show({type:"warning",time:3e3,text:i("xiconf","MSG:drop:invalidFile")});var r=new FormData;r.append("update",o);var a=this.ajax({type:"POST",url:"/xiconf;upload",data:r,processData:!1,contentType:!1});a.fail(function(){n.msg.show({type:"error",time:3e3,text:i("xiconf","MSG:drop:upload:failure")})}),a.done(function(){n.msg.show({type:"success",time:2500,text:i("xiconf","MSG:drop:upload:success")})})}})});