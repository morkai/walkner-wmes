define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form>\n  <div class="form-group">\n    <label class="control-label">'),__append(helpers.t("copySettings:source")),__append('</label>\n    <p class="form-control-static">'),__append(escapeFn(source)),__append('</p>\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-target" class="control-label">'),__append(helpers.t("copySettings:target")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-target" name="target" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    '),["in","nin"].forEach(function(n){__append('\n    <div class="radio">\n      <label class="control-label">\n        <input type="radio" name="filter" value="'),__append(n),__append('">\n        '),__append(helpers.t("copySettings:mrps:"+n)),__append("\n      </label>\n    </div>\n    ")}),__append('\n    <input id="'),__append(idPrefix),__append('-mrps" name="mrps" type="text" autocomplete="new-password">\n  </div>\n  <div class="form-group">\n    <label class="control-label">'),__append(helpers.t("copySettings:what")),__append("</label>\n    "),["workerCount","activeTime","orderPriority"].forEach(function(n){__append('\n    <div class="checkbox">\n      <label>\n        <input name="what[]" type="checkbox" value="'),__append(n),__append('" checked>\n        '),__append(helpers.t("copySettings:what:"+n)),__append("\n      </label>\n    </div>\n    ")}),__append('\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">\n      <span class="fa fa-spinner fa-spin hidden"></span>\n      <span>'),__append(helpers.t("copySettings:submit")),__append('</span>\n    </button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});