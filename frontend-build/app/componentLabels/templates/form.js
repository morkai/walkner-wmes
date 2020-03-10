define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="componentLabels-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-componentCode" class="control-label is-required">'),__append(t("PROPERTY:componentCode")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-componentCode" name="componentCode" class="form-control text-mono" type="text" autocomplete="new-password" required pattern="^[0-9]{12}$" maxlength="12" style="width: 120px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-operationNo" class="control-label is-required">'),__append(t("PROPERTY:operationNo")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-operationNo" name="operationNo" class="form-control text-mono" type="text" autocomplete="new-password" required pattern="^[0-9]{4}$" maxlength="4" style="width: 60px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-template-0" class="control-label is-required">'),__append(t("PROPERTY:template")),__append("</label>\n        <br>\n        "),TEMPLATES.forEach(function(e,n){__append('\n        <label class="radio-inline">\n          <input id="'),__append(idPrefix),__append("-template-"),__append(n),__append('" name="template" type="radio" value="'),__append(escapeFn(e)),__append('" required>\n          '),__append(escapeFn(e)),__append("\n        </label>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-description" class="control-label">'),__append(t("PROPERTY:description")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-description" name="description" class="form-control" type="text" autocomplete="new-password">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});