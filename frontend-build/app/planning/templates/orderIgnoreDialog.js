define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<div>\n  "),__append(t("planning","orders:menu:"+action+":message",{plan:plan,mrp:mrp,order:order})),__append('\n  <div class="form-actions">\n    <button class="btn btn-primary dialog-answer" type="button" autofocus data-answer="yes">'),__append(t("planning","orders:menu:"+action+":yes")),__append('</button>\n    <button class="btn btn-link cancel" type="button">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</div>\n");return __output.join("")}});