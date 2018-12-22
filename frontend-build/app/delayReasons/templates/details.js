define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">'),__append(helpers.t("core","PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:name")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(model.name)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:active")),__append('</div>\n        <div class="prop-value">'),__append(model.active),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:drm")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(model.drm||"-")),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:requireComponent")),__append('</div>\n        <div class="prop-value">'),__append(model.requireComponent),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});