define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="wh-set-editor wh-set-editor-problem">\n  <input type="text" autocomplete="new-password" class="form-control" value="'),__append(escapeFn(problemArea)),__append('" placeholder="'),__append(t("wh","set:problemEditor:problemArea")),__append('" required>\n  <button class="btn btn-danger"><i class="fa fa-shopping-cart"></i></button>\n  <textarea class="form-control" placeholder="'),__append(t("wh","set:problemEditor:comment")),__append('">'),__append(escapeFn(comment)),__append("</textarea>\n</form>\n");return __output.join("")}});