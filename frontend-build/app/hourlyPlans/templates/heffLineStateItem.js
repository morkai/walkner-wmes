define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="heffLineStates-item well">\n  <h3 class="heffLineStates-item-hd"><span class="heffLineStates-item-title">'),__append(escapeFn(prodLine)),__append('</span></h3>\n  <input class="form-control no-controls" type="text" value="'),__append(escapeFn(plan)),__append('" data-line="'),__append(escapeFn(prodLine)),__append('">\n</div>\n');return __output.join("")}});