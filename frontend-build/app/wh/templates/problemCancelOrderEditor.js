define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="wh-problems-editor wh-problems-editor-cancelOrder">\n  <textarea class="form-control" rows="3" placeholder="'),__append(helpers.t("problem:editor:comment")),__append('">'),__append(escapeFn(comment)),__append('</textarea>\n  <div class="wh-problems-editor-actions">\n    <button class="btn btn-lg btn-primary" type="button">'),__append(helpers.t("problem:editor:cancelOrder:yes")),__append('</button>\n    <button class="btn btn-lg btn-default" type="button">'),__append(helpers.t("problem:editor:cancelOrder:no")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});