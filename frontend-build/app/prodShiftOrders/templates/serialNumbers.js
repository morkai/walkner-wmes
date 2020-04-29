define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="panel panel-default is-with-actions prodShiftOrders-serialNumbers-panel">\n  <div class="panel-heading">\n    <div class="panel-heading-title">'),__append(helpers.t("serialNumbers:panel:title")),__append('</div>\n    <div class="panel-heading-actions">\n      <div id="'),__append(idPrefix),__append('-totals" style="margin-right: 12px"></div>\n      <a class="btn btn-default" href="#prodSerialNumbers?sort(scannedAt)&limit(20)&prodShiftOrder='),__append(prodShiftOrderId),__append('" title="'),__append(t("serialNumbers:panel:openList")),__append('"><i class="fa fa-list"></i></a>\n    </div>\n  </div>\n  <div class="panel-body">\n    <div class="prodShiftOrders-serialNumbers-list">\n      '),serialNumbers.forEach(function(e){__append('\n      <div class="prodShiftOrders-serialNumbers-item '),__append(e.taktTime>1e3*e.sapTaktTime?"is-over":"is-under"),__append('">\n        #'),__append(e.serialNo),__append("\n        "),__append(time.format(e.scannedAt,"LTS")),__append("\n        "),__append(Math.round(e.taktTime/1e3)),__append("s\n      </div>\n      ")}),__append('\n    </div>\n    <div id="'),__append(idPrefix),__append('-chart" class="prodShiftOrders-serialNumbers-chart"></div>\n  </div>\n</div>\n');return __output}});