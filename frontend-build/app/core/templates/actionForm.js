define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<form class="action-form" method="post" action="',formAction,'">\n  <input type="hidden" name="_method" value="',formMethod,'">\n  <p>',messageText,'</p>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-',formActionSeverity,'">',formActionText,"</button>\n    "),"#"===cancelUrl?buf.push('\n    <button type="button" class="cancel btn btn-link">',t("core","ACTION_FORM:BUTTON:cancel"),"</button>\n    "):buf.push('\n    <a class="cancel" href="',cancelUrl,'">',t("core","ACTION_FORM:BUTTON:cancel"),"</a>\n    "),buf.push("\n  </div>\n</form>\n")}();return buf.join("")}});