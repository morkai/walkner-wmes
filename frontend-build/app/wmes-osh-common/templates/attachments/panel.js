define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="panel panel-default osh-attachments-panel">\n  <div class="panel-heading '),__append(unseen?"osh-unseen":""),__append('">\n    '),__append(t("attachments:panelTitle")),__append('\n  </div>\n  <div class="panel-body">\n    '),attachments.length?(__append('\n      <div class="osh-attachments">\n        '),attachments.forEach(n=>{__append('\n        <div class="osh-attachment" data-id="'),__append(n._id),__append('" title="'),__append(escapeFn(n.name)),__append('">\n          '),n.image?(__append('\n          <a class="osh-attachment-img" href="'),__append(n.url),__append('" style="background-image: url(\''),__append(n.url),__append("?min=1')\"></a>\n          ")):(__append('\n          <a class="osh-attachment-icon" href="'),__append(n.url),__append('" target="_blank">\n            <i class="fa '),__append(n.icon),__append('"></i>\n          </a>\n          ')),__append('\n          <div class="osh-attachment-name">'),__append(escapeFn(n.name)),__append("</div>\n        </div>\n        ")}),__append("\n      </div>\n    ")):(__append("\n      <p><em>"),__append(t("attachments:empty")),__append("</em></p>\n    ")),__append("\n  </div>\n</div>\n");return __output}});