define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="wh-set-editor wh-set-editor-printLabels">\n  <input type="number" class="form-control" value="1" required min="1" max="10" step="1">\n  <button class="btn btn-primary"><i class="fa fa-print"></i></button>\n</form>\n');return __output.join("")}});