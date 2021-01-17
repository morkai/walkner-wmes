define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <div class="checkbox">\n          <label class="control-label">\n            <input id="'),__append(id("active")),__append('" type="checkbox" name="active" value="true">\n            '),__append(t("PROPERTY:active")),__append('\n          </label>\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("name")),__append('" class="control-label is-required">'),__append(t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(id("name")),__append('" class="form-control" type="text" name="name" required maxlength="200">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("description")),__append('" class="control-label">'),__append(t("PROPERTY:description")),__append('</label>\n        <textarea id="'),__append(id("description")),__append('" class="form-control" type="text" name="description" rows="5"></textarea>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("mrp")),__append('" class="control-label">'),__append(t("PROPERTY:mrp")),__append('</label>\n        <input id="'),__append(id("mrp")),__append('" type="text" name="mrp">\n      </div>\n      '),["productInclude","productExclude","bomInclude","bomExclude"].forEach(function(n){__append('\n      <div class="form-group">\n        <label for="'),__append(id(n)),__append('" class="control-label">'),__append(t("PROPERTY:"+n)),__append("</label>\n        "),t.has("FORM:help:"+n)&&(__append('\n        <p class="help-block">'),__append(t("FORM:help:"+n)),__append("</p>\n        ")),__append('\n        <textarea id="'),__append(id(n)),__append('" class="form-control text-mono" rows="7" name="'),__append(n),__append('"></textarea>\n      </div>\n      ')}),__append('\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});