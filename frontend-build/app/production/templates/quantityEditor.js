define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="production-quantityEditor">\n  <label for="',idPrefix,'-quantity">',escape(t("production","quantityEditor:label",{from:from,to:to})),'</label>\n  <input id="',idPrefix,'-quantity" class="form-control input-lg" type="number" value="',escape(currentQuantity),'" min="0">\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary">',t("production","quantityEditor:submit"),'</button>\n    <button type="button" class="cancel btn btn-link">',t("production","quantityEditor:cancel"),"</button>\n  </div>\n</form>\n")}();return buf.join("")}});