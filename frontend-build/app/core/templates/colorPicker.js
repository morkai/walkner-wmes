define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="form-group">\n  <label for="'),__append(idPrefix),__append("-"),__append(property),__append('" class="control-label">'),__append("string"==typeof label?label:t("core","colorPicker:label")),__append('</label>\n  <div class="input-group colorpicker-component" data-color="'),__append(value),__append('" data-color-format="hex">\n    <input id="'),__append(idPrefix),__append("-"),__append(property),__append('" class="form-control" name="'),__append(property),__append('" type="text" autocomplete="new-password" value="'),__append(value),__append('">\n    <span class="input-group-addon"><i style="background-color: '),__append(value),__append('"></i></span>\n  </div>\n</div>\n');return __output.join("")}});