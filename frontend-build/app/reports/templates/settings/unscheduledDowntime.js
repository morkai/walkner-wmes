define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{}){var metric="unscheduledDowntime";__append("\n"),function(){__append('<div class="panel-body" data-tab="'),__append(metric),__append('">\n  '),__append(renderColorPicker({idPrefix:idPrefix,property:"reports."+metric+".color",label:t("reports","settings:color"),value:colors[metric]})),__append("\n  "),function(){__append("<label>"),__append(t("reports","settings:metricRefs")),__append('</label>\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(metric),__append('-overall">'),__append(t("reports","settings:overall")),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(metric),__append('-overall" class="form-control" name="reports.'),__append(metric),__append('.overall" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(metric),__append('-prod">'),__append(t("reports","settings:prod")),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(metric),__append('-prod" class="form-control" name="reports.'),__append(metric),__append('.prod" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  //--><div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(metric),__append('-press">'),__append(t("reports","settings:press")),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(metric),__append('-press" class="form-control" name="reports.'),__append(metric),__append('.press" type="number" value="0" step="1" min="0" max="100">\n  </div>\n</div>\n'),divisions.forEach(function(p){__append('\n<div class="reports-settings-metricRefs">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(metric),__append("-"),__append(p._id),__append('">'),__append(escape(p.label)),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(metric),__append("-"),__append(p._id),__append('" class="form-control" name="reports.'),__append(metric),__append("."),__append(p._id),__append('" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  '),p.subdivisions.forEach(function(p){__append('\n  //--><div class="form-group">\n    <label for="'),__append(idPrefix),__append("-"),__append(metric),__append("-"),__append(p._id),__append('">'),__append(escape(p.label)),__append('</label>\n    <input id="'),__append(idPrefix),__append("-"),__append(metric),__append("-"),__append(p._id),__append('" class="form-control" name="reports.'),__append(metric),__append("."),__append(p._id),__append('" type="number" value="0" step="1" min="0" max="100">\n  </div><!--\n  ')}),__append("\n  //-->\n</div>\n")}),__append("\n")}.call(this),__append("\n</div>\n")}.call(this),__append("\n")}return __output.join("")}});