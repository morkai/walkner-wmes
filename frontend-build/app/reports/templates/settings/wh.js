define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel-body" data-tab="wh">\n  '),__append(renderColorPicker({idPrefix:idPrefix,property:"reports.absence.color",label:t("reports","settings:color:absence"),value:colors.absence})),__append('\n  <div class="clearfix">\n    <div class="pull-left">\n      <h3>'),__append(t("reports","settings:wh:comp")),__append('</h3>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-wh-comp-id">'),__append(t("reports","settings:wh:subdivision")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-wh-comp-id" name="reports.wh.comp.id" type="text" autocomplete="new-password">\n      </div>\n      '),["inComp","coopComp","exStorage","fifo","staging","sm","paint","fixBin","compAbsence"].forEach(function(p){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-wh-"),__append(p),__append('-prodTask">'),__append(t("reports","settings:wh:"+p)),__append('</label>\n        <input id="'),__append(idPrefix),__append("-wh-"),__append(p),__append('-prodTask" name="reports.wh.'),__append(p),__append('.prodTask" type="text" autocomplete="new-password">\n      </div>\n      ')}),__append('\n    </div>\n    <div class="pull-left">\n      <h3>'),__append(t("reports","settings:wh:finGoods")),__append('</h3>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-wh-finGoods-id">'),__append(t("reports","settings:wh:subdivision")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-wh-finGoods-id" name="reports.wh.finGoods.id" type="text" autocomplete="new-password">\n      </div>\n      '),["finGoodsIn","finGoodsOut","finGoodsAbsence"].forEach(function(p){__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append("-wh-"),__append(p),__append('-prodTask">'),__append(t("reports","settings:wh:"+p)),__append('</label>\n        <input id="'),__append(idPrefix),__append("-wh-"),__append(p),__append('-prodTask" name="reports.wh.'),__append(p),__append('.prodTask" type="text" autocomplete="new-password">\n      </div>\n      ')}),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});