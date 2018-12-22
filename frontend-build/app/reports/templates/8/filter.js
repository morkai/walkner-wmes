define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="reports-8-filter-columns">\n    <div class="reports-8-filter-column">\n      '),__append(forms.dateTimeRange({idPrefix,required:!0,labels:{text:t("core","filter:date:from"),ranges:!0},separator:t("core","filter:date:to")})),__append('\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","filter:interval")),__append("</label>\n        "),["month","week","day"].forEach(function(n){__append('\n        <div class="radio">\n          <label>\n            <input type="radio" name="interval" value="'),__append(n),__append('"> '),__append(t("reports","filter:interval:title:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","8:filter:unit")),__append("</label>\n        <br>\n        "),["m","h"].forEach(function(n){__append('\n        <div class="radio-inline">\n          <label>\n            <input type="radio" name="unit" value="'),__append(n),__append('"> '),__append(t("reports","8:filter:unit:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","8:filter:days")),__append("</label>\n        "),[1,2,3,4,5,6,7,"noWork"].forEach(function(n){__append('\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="days[]" value="'),__append(n),__append('"> '),__append(t("reports","8:filter:days:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","8:filter:shifts")),__append("</label>\n        <br>\n        "),[1,2,3].forEach(function(n){__append('\n        <div class="checkbox-inline">\n          <label>\n            <input type="checkbox" name="shifts[]" value="'),__append(n),__append('"> '),__append(t("core","SHIFT:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","8:filter:divisions")),__append("</label>\n        "),divisions.forEach(function(n,e){__append("\n        "),e%2==0&&__append("<br>"),__append('\n        <div class="checkbox-inline">\n          <label>\n            <input type="checkbox" name="divisions[]" value="'),__append(n.id),__append('"> '),__append(escapeFn(n.text)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("reports","filter:subdivisionType")),__append("</label>\n        "),["assembly","press","paintShop"].forEach(function(n){__append('\n        <div class="checkbox">\n          <label>\n            <input type="checkbox" name="subdivisionTypes[]" value="'),__append(n),__append('"> '),__append(t("reports","filter:subdivisionType:"+n)),__append("\n          </label>\n        </div>\n        ")}),__append('\n      </div>\n    </div>\n    <div class="reports-8-filter-column">\n      '),_.forEach(numericProps,function(n,e){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-"),__append(e),__append('">'),__append(t("reports","8:filter:"+e)),__append('</label>\n        <input id="'),__append(idPrefix),__append("-"),__append(e),__append('" name="'),__append(e),__append('" class="form-control" type="number" min="0" step="1">\n      </div>\n      ')}),__append('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-prodLines">'),__append(t("reports","8:filter:prodLines")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-prodLines" name="prodLines" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("reports","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});