define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<div class="panel panel-default">\n  <div class="panel-heading is-with-actions">\n    <span class="panel-heading-title"></span>\n    '),function(){__append('<div class="panel-actions">\n  <button class="btn btn-default" type="button" role="moveUp"><i class="fa fa-arrow-up"></i></button>\n  <button class="btn btn-default" type="button" role="moveDown"><i class="fa fa-arrow-down"></i></button>\n  <button class="btn btn-danger" type="button" role="remove"><i class="fa fa-times"></i></button>\n</div>\n')}.call(this),__append('\n  </div>\n  <div class="panel-body has-lastElementRow">\n    <div class="form-row">\n      <div class="form-group">\n        <label for="'),__append(id("lampIp")),__append('" class="control-label">'),__append(t("PROPERTY:stations:lampIp")),__append('</label>\n        <input id="'),__append(id("lampIp")),__append('" class="form-control" type="text" name="stations['),__append(stationIndex),__append('].lampIp" style="width: 150px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("redLampI")),__append('" class="control-label">'),__append(t("PROPERTY:stations:redLampI")),__append('</label>\n        <input id="'),__append(id("redLampI")),__append('" class="form-control" type="text" name="stations['),__append(stationIndex),__append('].redLampI" style="width: 150px">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(id("orangeLampI")),__append('" class="control-label">'),__append(t("PROPERTY:stations:orangeLampI")),__append('</label>\n        <input id="'),__append(id("orangeLampI")),__append('" class="form-control" type="text" name="stations['),__append(stationIndex),__append('].orangeLampI" style="width: 150px">\n      </div>\n    </div>\n  </div>\n</div>\n');return __output}});