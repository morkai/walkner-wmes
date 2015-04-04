define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel-body" data-tab="wh">\n  '),__output.push(renderColorPicker({idPrefix:idPrefix,property:"reports.absence.color",label:t("reports","settings:color:absence"),value:colors.absence})),__output.push('\n  <div class="clearfix">\n    <div class="pull-left">\n      <h3>'),__output.push(t("reports","settings:wh:comp")),__output.push('</h3>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-wh-comp-id">'),__output.push(t("reports","settings:wh:subdivision")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-wh-comp-id" name="reports.wh.comp.id" type="text">\n      </div>\n      '),["inComp","coopComp","exStorage","fifo","staging","sm","paint","fixBin","compAbsence"].forEach(function(u){__output.push('\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push("-wh-"),__output.push(u),__output.push('-prodTask">'),__output.push(t("reports","settings:wh:"+u)),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push("-wh-"),__output.push(u),__output.push('-prodTask" name="reports.wh.'),__output.push(u),__output.push('.prodTask" type="text">\n      </div>\n      ')}),__output.push('\n    </div>\n    <div class="pull-left">\n      <h3>'),__output.push(t("reports","settings:wh:finGoods")),__output.push('</h3>\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push('-wh-finGoods-id">'),__output.push(t("reports","settings:wh:subdivision")),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push('-wh-finGoods-id" name="reports.wh.finGoods.id" type="text">\n      </div>\n      '),["finGoodsIn","finGoodsOut","finGoodsAbsence"].forEach(function(u){__output.push('\n      <div class="form-group">\n        <label for="'),__output.push(idPrefix),__output.push("-wh-"),__output.push(u),__output.push('-prodTask">'),__output.push(t("reports","settings:wh:"+u)),__output.push('</label>\n        <input id="'),__output.push(idPrefix),__output.push("-wh-"),__output.push(u),__output.push('-prodTask" name="reports.wh.'),__output.push(u),__output.push('.prodTask" type="text">\n      </div>\n      ')}),__output.push("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});