define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="mechOrders-import">\n  <div class="form-group">\n    <label for="',idPrefix,'-file">',t("mechOrders","import:file"),'</label>\n    <input id="',idPrefix,'-file" name="mechOrders" class="form-control" type="file" autofocus>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">',t("mechOrders","import:submit"),'</button>\n    <button type="button" class="cancel btn btn-link">',t("mechOrders","import:cancel"),"</button>\n  </div>\n</form>\n")}();return buf.join("")}});