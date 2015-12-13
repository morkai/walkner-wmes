define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-name">'),__append(t("xiconfPrograms","PROPERTY:name")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-name" class="form-control" name="name" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-type">'),__append(t("xiconfPrograms","PROPERTY:type")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-type" class="form-control" name="type">\n      <option></option>\n      '),programTypes.forEach(function(n){__append('\n      <option value="'),__append(n),__append('">'),__append(t("xiconfPrograms","type:"+n)),__append("</option>\n      ")}),__append("\n    </select>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escape(t("xiconfPrograms","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});