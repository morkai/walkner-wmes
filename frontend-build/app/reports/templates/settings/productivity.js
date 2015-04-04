define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{}){var metric="productivity";__output.push('\n<div class="panel-body" data-tab="'),__output.push(metric),__output.push('">\n  '),__output.push(renderColorPicker({idPrefix:idPrefix,property:"reports."+metric+".color",label:t("reports","settings:color"),value:colors[metric]})),__output.push('\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-prodNumConstant-coeff">'),__output.push(t("reports","settings:coeff")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-prodNumConstant-coeff" class="form-control" name="reports.prodNumConstant.coeff" type="number" min="0" step="0.0001">\n  </div>\n  '),function(){__output.push("<label>"),__output.push(t("reports","settings:metricRefs")),__output.push('</label>\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-overall">'),__output.push(t("reports","settings:overall")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-overall" class="form-control" name="reports.'),__output.push(metric),__output.push('.overall" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-prod">'),__output.push(t("reports","settings:prod")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-prod" class="form-control" name="reports.'),__output.push(metric),__output.push('.prod" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-press">'),__output.push(t("reports","settings:press")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push('-press" class="form-control" name="reports.'),__output.push(metric),__output.push('.press" type="number" value="0" step="1" min="0" max="100">\n  </div>\n</div>\n'),divisions.forEach(function(u){__output.push('\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push("-"),__output.push(u._id),__output.push('">'),__output.push(escape(u.label)),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push("-"),__output.push(u._id),__output.push('" class="form-control" name="reports.'),__output.push(metric),__output.push("."),__output.push(u._id),__output.push('" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  '),u.subdivisions.forEach(function(u){__output.push('\n  //--><div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push("-"),__output.push(u._id),__output.push('">'),__output.push(escape(u.label)),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-"),__output.push(metric),__output.push("-"),__output.push(u._id),__output.push('" class="form-control" name="reports.'),__output.push(metric),__output.push("."),__output.push(u._id),__output.push('" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  ')}),__output.push("\n  //-->\n</div>\n")}),__output.push("\n")}(),__output.push("\n</div>\n")}return __output.join("")}});