define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="wiring-list-editor-form">\n  '),"finish"===action&&(__append('\n  <input class="form-control" type="text" value="'),__append(qtyDone),__append('" placeholder="'),__append(qty),__append('" pattern="^\\+?[0-9]{1,4}$">\n  ')),__append('\n  <button class="btn btn-success" type="submit"><i class="fa fa-check"></i><span>'),__append(t("action:"+action)),__append('</span></button>\n  <button class="btn btn-danger" type="button"><i class="fa fa-times"></i><span>'),__append(t("action:nope")),__append("</span></button>\n</form>\n");return __output.join("")}});