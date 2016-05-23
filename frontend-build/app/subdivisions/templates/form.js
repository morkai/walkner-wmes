define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="subdivisions-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="orgUnitDropdowns-container"></div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-type" class="control-label is-required">'),__append(t("subdivisions","PROPERTY:type")),__append("</label>\n        "),["assembly","press","storage","paintShop","other"].forEach(function(n){__append('\n        <div class="radio">\n          <label><input type="radio" name="type" value="'),__append(n),__append('" checked> '),__append(t("subdivisions","TYPE:"+n)),__append("</label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(t("subdivisions","PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" name="name" required maxlength="150">\n      </div>\n      '),["prodTaskTags","aor","initialDowntime","autoDowntime"].forEach(function(n){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-"),__append(n),__append('" class="control-label">'),__append(t("subdivisions","PROPERTY:"+n)),__append('</label>\n        <input id="'),__append(idPrefix),__append("-"),__append(n),__append('" type="text" name="'),__append(n),__append('">\n      </div>\n      ')}),__append('\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});