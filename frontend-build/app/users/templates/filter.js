define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-personellId">'),__append(t("users","PROPERTY:personellId")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-personellId" class="form-control" name="personellId" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-login">'),__append(t("users","PROPERTY:login")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-login" class="form-control" name="login" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-searchName">'),__append(t("users","PROPERTY:lastName")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-searchName" class="form-control" name="searchName" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-prodFunction">'),__append(t("users","PROPERTY:prodFunction")),__append('</label>\n    <select id="'),__append(idPrefix),__append('-prodFunction" class="form-control" name="prodFunction">\n      <option></option>\n      '),prodFunctions.forEach(function(n){__append('\n      <option value="'),__append(escapeFn(n.id)),__append('">'),__append(escapeFn(n.text)),__append("</option>\n      ")}),__append("\n    </select>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("users","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});