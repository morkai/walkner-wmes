// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","../i18n","../time","../core/Model","../core/util/uuid"],function(e,t,r,n,s,a){"use strict";return s.extend({defaults:{folder:null,nc15:"",date:"",name:"",file:null,hash:"",progress:-1,error:null},initialize:function(e,t){this.xhr=null,this.nameChanged=!(!t||!t.nameChanged),this.once("change:name",function(){this.nameChanged=!0},this)},needsRealName:function(){return!this.nameChanged&&15===this.get("nc15").length},isUploadable:function(){return!this.xhr&&!this.isUploaded()&&!!this.get("file")&&"application/pdf"===this.get("file").type},isReuploadable:function(){return this.isUploadable()&&null!==this.get("error")},isUploaded:function(){return 32===this.get("hash").length},isError:function(){return!!this.get("error")},getStatusClassName:function(){if(this.get("error"))return"danger";var e=this.get("progress");return 100===e?"success":-1===e?"primary":"warning"},getProgress:function(){return this.get("error")?100:Math.floor(Math.max(0,this.get("progress")))},getMessage:function(){var e=this.get("error");return e?r.has("orderDocumentTree","uploads:error:"+e)?r("orderDocumentTree","uploads:error:"+e):e:""},serializeDetails:function(){return{id:this.id,nc15:this.get("nc15"),date:this.get("date"),name:this.get("name"),statusClassName:this.getStatusClassName(),virtual:!this.get("file"),progress:this.getProgress(),message:this.getMessage()}},serializeFile:function(){return{upload:this.id,folder:this.get("folder").id,nc15:this.get("nc15"),hash:this.get("hash"),date:this.get("date"),name:this.get("name")}},start:function(){var e=this;if(!e.xhr){var r=function(t){t.lengthComputable&&e.set("progress",Math.min(Math.floor(t.loaded/t.total*100),99))},n=new FormData;n.append("file",this.get("file")),e.xhr=t.ajax({type:"POST",url:"/orderDocuments/uploads",data:n,dataType:"text",processData:!1,contentType:!1,xhr:function(){var e=new XMLHttpRequest;return e.upload&&e.upload.addEventListener("progress",r),e}}),e.xhr.done(function(){/^[a-f0-9]{32}$/.test(e.xhr.responseText)?e.set({hash:e.xhr.responseText,progress:100}):e.set("error","INVALID_RESPONSE")}),e.xhr.fail(function(){e.set("error",e.xhr.responseText||"UNKNOWN_ERROR")}),e.xhr.always(function(){e.xhr=null,e.trigger("upload:done")}),e.set("progress",0),e.trigger("upload:start",e,e.xhr)}},stop:function(){this.xhr&&this.xhr.abort()}},{fromDocument:function(t,r,s){var i=t.get("files"),o=s?e.find(i,function(e){return e.hash===s}):i[0];return new this({_id:a(),folder:r,nc15:t.id,date:n.utc.format(o.date,"YYYY-MM-DD"),name:t.get("name"),hash:o.hash,progress:100},{nameChanged:!0})},fromFile:function(e,t){var r=this.resolveNc15(e.name),s=n.format(Date.now(),"YYYY-MM-DD"),i=this.resolveName(e.name,r),o=null;return"application/pdf"!==e.type&&(o="INVALID_TYPE"),new this({_id:a(),folder:t,nc15:r,date:s,name:i,file:e,error:o})},resolveNc15:function(e){var t=e.match(/([0-9]{15}|[0-9]{12,15})/);if(!t)return"";for(var r=t[1];r.length<15;)r="0"+r;return r},resolveName:function(e,t){var r=e.replace(/\.pdf/i,"");return t&&(r=r.replace(t,"")),r=r.replace(/^[^A-Za-z0-9ęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+/,"").replace(/[^A-Za-z0-9ęóąśłżźćńĘÓĄŚŁŻŹĆŃ]+$/,""),""===r?t:r}})});