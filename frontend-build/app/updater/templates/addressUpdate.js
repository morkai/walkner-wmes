define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="updater-addressUpdate">\n  '),__append(t("updater","addressUpdate:message",{network:network})),__append("\n  <p>"),__append(t("updater","addressUpdate:old",{oldAddress:oldAddress})),__append("</p>\n  <p>"),__append(t("updater","addressUpdate:new",{newAddress:newAddress})),__append('</p>\n  <p style="text-align: center">\n    <button id="'),__append(idPrefix),__append('-go" class="btn btn-primary btn-block btn-lg" type="button">\n      '),__append(t("updater","addressUpdate:go")),__append("\n    </button>\n  </p>\n</div>\n");return __output.join("")}});