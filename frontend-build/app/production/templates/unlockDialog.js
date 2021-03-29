define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="production-'),__append(type),__append('Dialog" autocomplete="off">\n  <input id="'),__append(id("apiKey")),__append('" type="hidden" value="'),__append(apiKey),__append('">\n  '),"unlock"===type&&(__append('\n  <div class="production-form-btn-group">\n    <label class="control-label is-required">'),__append(t("unlockDialog:prodLine")),__append('</label>\n    <div id="'),__append(id("list")),__append('" class="btn-group-vertical">\n      <p>\n        <i class="fa fa-spinner fa-spin"></i>\n      </p>\n    </div>\n  </div>\n  <div class="form-group">\n    <label class="control-label is-required">'),__append(t("unlockDialog:station")),__append('</label>\n    <br>\n    <div class="btn-group production-unlockDialog-stations" data-toggle="buttons">\n      '),[1,2,3,4,5,6,7].forEach(function(n){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="station" value="'),__append(n),__append('"> '),__append(n),__append("\n      </label>\n      ")}),__append("\n    </div>\n  </div>\n  ")),__append("\n  "),apiKey||(__append('\n  <div class="form-group">\n    <label for="'),__append(id("login")),__append('" class="control-label is-required">'),__append(t("unlockDialog:login")),__append('</label>\n    <input id="'),__append(id("login")),__append('" class="form-control is-embedded" type="text" autocomplete="new-password" required data-vkb="alpha numeric">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("password")),__append('" class="control-label is-required">'),__append(t("unlockDialog:password")),__append('</label>\n    <input id="'),__append(id("password")),__append('" class="form-control is-embedded" type="password" autocomplete="new-password" required data-vkb="alpha numeric extended">\n  </div>\n  ')),__append('\n  <div class="form-actions">\n    <button id="'),__append(id("submit")),__append('" class="btn btn-lg btn-primary" type="submit">'),__append(t("unlockDialog:"+type)),__append('</button>\n    <button class="btn btn-lg btn-link cancel" type="button">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output}});