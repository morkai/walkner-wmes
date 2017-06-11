define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="panel panel-primary">\n    <div class="panel-heading">\n      '),__append(t("xiconfPrograms","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:name")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.name)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:prodLines")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.prodLines)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:type")),__append('</div>\n          <div class="prop-value">'),__append(t("xiconfPrograms","type:"+model.type)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:createdAt")),__append('</div>\n          <div class="prop-value">'),__append(model.createdAt),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:updatedAt")),__append('</div>\n          <div class="prop-value">'),__append(model.updatedAt),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.steps.forEach(function(p,n){__append("\n  "),function(){p.enabled&&(__append("\n"),"wait"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-wait">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:wait")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:waitKind")),__append('</div>\n        <div class="prop-value">\n          '),__append(t("xiconfPrograms","PROPERTY:waitKind:"+p.kind)),__append("\n          "),"auto"===p.kind&&(__append("\n          "),__append(escapeFn(time.toString(p.duration,!1,!0))),__append("\n          ")),__append("\n        </div>\n      </div>\n      "),"t24vdc"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.voltage.toLocaleString())),__append("</div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"pe"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-pe">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:pe")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      '),"t24vdc"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.voltage.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:resistance:max")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.resistanceMax.toLocaleString())),__append("</div>\n      </div>\n      ")),__append("\n      "),"glp2"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.label)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:resistance:max")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.setValue.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:current")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.ipr.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.u.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:buzzer")),__append('</div>\n        <div class="prop-value">'),__append(t("xiconfPrograms","PROPERTY:buzzer:"+p.buzzer)),__append("</div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"iso"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-iso">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:iso")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.label)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:mode")),__append('</div>\n        <div class="prop-value">'),__append(t("xiconfPrograms","glp2:iso:mode:"+p.mode)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:iso:mode:"+p.mode+":label")),__append('</div>\n        <div class="prop-value">'),__append(p.setValue.toLocaleString()),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:iso:u")),__append('</div>\n        <div class="prop-value">'),__append(p.u.toLocaleString()),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:iso:rMax")),__append('</div>\n        <div class="prop-value">'),__append(p.rMax?p.rMax.toLocaleString():"-"),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:iso:ramp")),__append('</div>\n        <div class="prop-value">'),__append(time.toString(p.ramp,!1,!0)),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"sol"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-sol">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:sol")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.voltage.toLocaleString())),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"program"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-program">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:program")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.label)),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"fn"===p.type?(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-fn">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:fn")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      '),"t24vdc"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.voltage.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        '),p.powerMin===p.powerMax&&p.powerReq===p.powerMin?(__append('\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:power:req")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.powerReq)),__append("</div>\n        ")):(__append('\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:power")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.powerMin)),__append(" ≤ <strong>"),__append(escapeFn(p.powerReq)),__append("</strong> ≤ "),__append(escapeFn(p.powerMax)),__append("</div>\n        ")),__append("\n      </div>\n      ")),__append("\n      "),"glp2"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.label)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:mode")),__append('</div>\n        <div class="prop-value">'),__append(t("xiconfPrograms","glp2:fn:mode:"+p.mode)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:fn:mode:"+p.mode+":label")),__append('</div>\n        <div class="prop-value">\n          '),5===p.mode?__append("\n          -\n          "):(__append("\n          "),0!==p.lowerToleranceRel&&0!==p.upperToleranceRel?(__append("\n          "),__append((Math.round(p.setValue*((100-p.lowerToleranceRel)/100)*100)/100).toLocaleString()),__append("\n          ≤ <strong>"),__append(p.setValue.toLocaleString()),__append("</strong>\n          ≤ "),__append((Math.round(p.setValue*((100+p.upperToleranceRel)/100)*100)/100).toLocaleString()),__append("\n          ")):(__append("\n          "),__append(p.lowerToleranceAbs.toLocaleString()),__append("\n          ≤ <strong>"),__append(p.setValue.toLocaleString()),__append("</strong>\n          ≤ "),__append(p.upperToleranceAbs.toLocaleString()),__append("\n          ")),__append("\n          ")),__append('\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:trigger")),__append('</div>\n        <div class="prop-value">'),__append(t("xiconfPrograms","PROPERTY:trigger:"+p.trigger)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:lampCount")),__append('</div>\n        <div class="prop-value">'),__append(p.lampCount||0),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:lampDuration")),__append('</div>\n        <div class="prop-value">'),__append(time.toString(p.lampDuration||0)),__append("</div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")):"vis"===p.type&&(__append("\n"),function(){__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-vis">\n  <div class="panel-heading">'),__append(n+1),__append(". "),__append(t("xiconfPrograms","step:vis")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(p.label)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:vis:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:vis:maxDuration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(p.maxDuration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:vis:mode")),__append('</div>\n        <div class="prop-value">'),__append(t("xiconfPrograms","glp2:vis:mode:"+p.mode)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:vis:goInput")),__append('</div>\n        <div class="prop-value">'),__append(p.goInput?t("xiconfPrograms","glp2:input:"+p.goInput):"-"),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("xiconfPrograms","glp2:vis:noGoInput")),__append('</div>\n        <div class="prop-value">'),__append(p.noGoInput?t("xiconfPrograms","glp2:input:"+p.noGoInput):"-"),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n")),__append("\n")),__append("\n")}.call(this),__append("\n  ")}),__append("\n</div>\n\n");return __output.join("")}});