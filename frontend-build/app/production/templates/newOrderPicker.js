define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="production-newOrderPicker">\n  '),replacingOrder&&buf.push('\n  <p class="message message-inline message-warning">',t("production","newOrderPicker:checkData:warning"),'</p>\n  <div class="form-group">\n    <label for="',idPrefix,'-quantityDone">',t("production","newOrderPicker:quantityDone"),'</label>\n    <input id="',idPrefix,'-quantityDone" class="form-control" type="number" value="',quantityDone,'" autofocus min="0" max="',maxQuantityDone,'">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-workerCount">',t("production","newOrderPicker:workerCount"),'</label>\n    <input id="',idPrefix,'-workerCount" class="form-control" type="number" value="',workerCount,'" min="1" max="',maxWorkerCount,'">\n  </div>\n  <div class="modal-header">\n    <h3 class="modal-title">',t("production","newOrderPicker:title"),"</h3>\n  </div>\n  "),buf.push("\n  "),correctingOrder||(buf.push("\n  "),offline?buf.push('\n  <p class="message message-inline message-warning">',t("production","newOrderPicker:offline:warning:"+orderIdType),"</p>\n  "):buf.push('\n  <p class="message message-inline message-info">',t("production","newOrderPicker:online:info:"+orderIdType),"</p>\n  "),buf.push("\n  ")),buf.push('\n  <div class="form-group">\n    <label for="',idPrefix,'-order">',t("production","newOrderPicker:order:label"),'</label>\n    <input id="',idPrefix,'-order" class="form-control" type="text" placeholder="',t("production","newOrderPicker:order:placeholder:"+orderIdType),'">\n  </div>\n  <div class="form-group">\n    <label for="',idPrefix,'-operation">',t("production","newOrderPicker:operation:label"),'</label>\n    <input id="',idPrefix,'-operation" class="form-control" type="text" placeholder="',t("production","newOrderPicker:offline:operation:placeholder"),'">\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-',correctingOrder?"primary":"success",'">\n      ',t("production","newOrderPicker:submit"+(replacingOrder?":replacing":correctingOrder?":correcting":"")),'\n    </button>\n    <button type="button" class="cancel btn btn-link">',t("production","newOrderPicker:cancel"),"</button>\n  </div>\n</form>\n")}();return buf.join("")}});