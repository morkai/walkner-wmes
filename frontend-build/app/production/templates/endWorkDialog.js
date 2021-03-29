define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<form class="production-endWorkDialog" autocomplete="off">\n  <p class="message message-inline message-warning">'),__append(t("endWorkDialog:warning",{downtime:downtime})),__append("</p>\n  "),spigot&&(__append('\n  <div id="'),__append(id("spigot")),__append('" class="form-group">\n    <label for="'),__append(id("spigot-nc12")),__append('">'),__append(t("endWorkDialog:spigot:nc12")),__append('</label>\n    <input id="'),__append(id("spigot-nc12")),__append('" class="form-control production-spigot-nc12 '),__append(embedded?"is-embedded":""),__append('" type="text" autocomplete="new-password" value="" placeholder="'),__append(t("endWorkDialog:spigot:placeholder")),__append('" required>\n  </div>\n  ')),__append('\n  <div class="form-group">\n    <label for="'),__append(id("quantitiesDone")),__append('">'),__append(t("endWorkDialog:quantitiesDone",{hourRange:hourRange})),__append('</label>\n    <input id="'),__append(id("quantitiesDone")),__append('" class="form-control small '),__append(embedded?"is-embedded":""),__append('" type="'),__append(embedded?"text":"number"),__append('" value="'),__append(quantitiesDone),__append('" min="0" max="'),__append(maxQuantitiesDone),__append('" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("quantityDone")),__append('">'),__append(t("endWorkDialog:quantityDone")),__append('</label>\n    <input id="'),__append(id("quantityDone")),__append('" class="form-control small '),__append(embedded?"is-embedded":""),__append('" type="'),__append(embedded?"text":"number"),__append('" value="'),__append(quantityDone),__append('" max="'),__append(maxQuantityDone),__append('" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(id("workerCount")),__append('">'),__append(t("endWorkDialog:workerCount")),__append('</label>\n    <input id="'),__append(id("workerCount")),__append('" class="form-control small '),__append(embedded?"is-embedded":""),__append('" type="'),__append(embedded?"text":"number"),__append('" value="'),__append(workerCount),__append('" min="1" max="'),__append(maxWorkerCount),__append('" data-ignore-key="1" data-vkb="numeric">\n  </div>\n  <div id="'),__append(id("ft")),__append('" class="hidden" style="margin-bottom: 15px">\n    <p class="message message-inline message-error">'),__append(t("ft:warning")),__append('</p>\n    <div class="form-group">\n      <label for="'),__append(id("ft-login")),__append('">'),__append(t("ft:login")),__append('</label>\n      <input id="'),__append(id("ft-login")),__append('" class="form-control is-embedded" type="text" required data-ignore-key="1" data-vkb="alpha numeric">\n    </div>\n    <div class="form-group">\n      <label for="'),__append(id("ft-password")),__append('">'),__append(t("ft:password")),__append('</label>\n      <input id="'),__append(id("ft-password")),__append('" class="form-control is-embedded" type="password" required autocomplete="new-password" data-ignore-key="1" data-vkb="alpha numeric extended">\n    </div>\n  </div>\n  <div class="form-actions">\n    <button id="'),__append(id("submit")),__append('" class="btn btn-lg btn-warning" type="submit">'),__append(t("endWorkDialog:yes")),__append('</button>\n    <button class="btn btn-lg btn-link cancel" type="button">'),__append(t("endWorkDialog:no")),__append("</button>\n  </div>\n</form>\n");return __output}});