define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(id("_id")),__append('" class="control-label is-required">'),__append(t("PROPERTY:_id")),__append('</label>\n        <input id="'),__append(id("_id")),__append('" class="form-control" type="text" name="_id" required '),__append(editMode?"disabled":""),__append('>\n        <a id="'),__append(id("duplicateKey")),__append('" class="form-control-static hidden" style="display: inline-block">'),__append(t("FORM:ERROR:duplicateKey")),__append('</a>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("paintFamily")),__append('" class="control-label is-required">'),__append(t("PROPERTY:paintFamily")),__append('</label>\n        <input id="'),__append(id("paintFamily")),__append('" class="form-control" type="text" name="paintFamily" required>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});