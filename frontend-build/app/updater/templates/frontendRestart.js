define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="updater-restart updater-restart-frontend">\n  <i class="fa fa-exclamation-circle updater-restart-icon"></i><span class="updater-restart-message">'),__output.push(t("updater","restart:frontend")),__output.push("</span>\n</div>\n");return __output.join("")}});