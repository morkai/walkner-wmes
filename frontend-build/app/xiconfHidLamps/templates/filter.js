define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),["_id","nc12","description"].forEach(function(n){__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(n),__append('">'),__append(t("xiconfHidLamps","PROPERTY:"+n)),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(n),__append('" class="form-control" name="'),__append(n),__append('" type="text">\n  </div>\n  ')}),__append("\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("xiconfHidLamps","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});