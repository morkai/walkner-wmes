define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default">\n  <div class="panel-heading is-with-actions">\n    '),__append(t("prodShiftOrders","PANEL:TITLE:serialNumbers")),__append('\n    <div class="panel-actions">\n      <a class="btn btn-default" href="#prodSerialNumbers?sort(scannedAt)&limit(20)&prodShiftOrder='),__append(prodShiftOrderId),__append('"><i class="fa fa-list"></i></a>\n    </div>\n  </div>\n  <div class="panel-body">\n    '),serialNumbers.length||(__append("\n    "),__append(t("core","LIST:NO_DATA")),__append("\n    ")),__append("\n    "),serialNumbers.forEach(function(n){__append('\n    <span class="label label-'),__append(n.taktTime>1e3*n.sapTaktTime?"danger":"success"),__append(' prodShiftOrders-serialNumber">\n      #'),__append(n.serialNo),__append(" "),__append(time.format(n.scannedAt,"HH:mm:ss")),__append(" /"),__append(Math.round(n.taktTime/1e3)),__append("s\n      "),n.iptTaktTime&&(__append("\n      /"),__append(Math.round(n.iptTaktTime/1e3)),__append("s\n      ")),__append("\n    </span>\n    ")}),__append("\n  </div>\n</div>\n");return __output.join("")}});