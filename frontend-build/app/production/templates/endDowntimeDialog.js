define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(n){return String(n).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="production-question">\n  ',t("production","endDowntimeDialog:message"),'\n  <div class="form-actions">\n    <button class="btn btn-',yesSeverity,' dialog-answer" type="button" autofocus data-answer="yes">',t("production","endDowntimeDialog:yes"),'</button>\n    <button class="btn btn-link cancel" type="button">',t("production","endDowntimeDialog:no"),"</button>\n  </div>\n</div>\n")}();return buf.join("")}});