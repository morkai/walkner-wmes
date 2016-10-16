define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escape=escape||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="settings qi-settings">\n  <div class="list-group">\n    '),["results","reports"].forEach(function(e){__append('\n    <a class="list-group-item" href="#qi/settings?tab='),__append(e),__append('" data-tab="'),__append(e),__append('">'),__append(t("qiResults","settings:tab:"+e)),__append("</a>\n    ")}),__append('\n  </div>\n  <div class="panel panel-primary">\n    <div class="panel-body" data-tab="results">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-requiredCount">'),__append(t("qiResults","settings:requiredCount")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-requiredCount" class="form-control" name="qi.requiredCount" type="number" min="0" max="9999">\n      </div>\n    </div>\n    <div class="panel-body" data-tab="reports">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-maxNokPerDay">'),__append(t("qiResults","settings:maxNokPerDay")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-maxNokPerDay" class="form-control" name="qi.maxNokPerDay" type="number" min="0" max="1000">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-okRatioRef">'),__append(t("qiResults","settings:okRatioRef")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-okRatioRef" class="form-control" name="qi.okRatioRef" type="number" min="0" max="100" step="0.01">\n      </div>\n    </div>\n  </div>\n</form>\n');return __output.join("")}});