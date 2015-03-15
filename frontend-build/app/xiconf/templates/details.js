define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(i){return String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="panel panel-default">\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:srcId"),'</div>\n          <div class="prop-value">',model.srcId,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:srcTitle"),'</div>\n          <div class="prop-value">',model.srcTitle,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:srcIp"),'</div>\n          <div class="prop-value">',model.srcIp,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:srcUuid"),'</div>\n          <div class="prop-value">',model.srcUuid,"</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.order&&buf.push('\n  <div class="panel panel-primary xiconf-details-order">\n    <div class="panel-heading">\n      ',t("xiconf","PANEL:TITLE:details:order"),'\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:no"),'</div>\n          <div class="prop-value">',model.order.no,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:quantity"),'</div>\n          <div class="prop-value">',model.order.quantity,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:successCounter"),'</div>\n          <div class="prop-value">',model.order.successCounter,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:failureCounter"),'</div>\n          <div class="prop-value">',model.order.failureCounter,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:startedAt"),'</div>\n          <div class="prop-value">',time.format(model.order.startedAt,"LL, HH:mm:ss.SSS"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:finishedAt"),'</div>\n          <div class="prop-value">',time.format(model.order.finishedAt,"LL, HH:mm:ss.SSS"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:duration"),'</div>\n          <div class="prop-value">',time.toString(model.order.duration/1e3,!1,!0),"</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),buf.push('\n  <div class="panel panel-',"success"===model.result?"success":"danger",' xiconf-details-entry">\n    <div class="panel-heading">\n      ',t("xiconf","PANEL:TITLE:details:entry"),'\n    </div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:serviceTag"),'</div>\n          <div class="prop-value">',model.serviceTag||"-",'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:nc12"),'</div>\n          <div class="prop-value">',model.nc12,'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:programName"),'</div>\n          <div class="prop-value">',escape(model.programName||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:counter"),'</div>\n          <div class="prop-value">',model.counter,"",model.order?"/"+model.order.quantity:"",'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:startedAt"),'</div>\n          <div class="prop-value">',time.format(model.startedAt,"LL, HH:mm:ss.SSS"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:finishedAt"),'</div>\n          <div class="prop-value">',time.format(model.finishedAt,"LL, HH:mm:ss.SSS"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:duration"),'</div>\n          <div class="prop-value">',time.toString(model.duration/1e3,!1,!0),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:errorCode"),'</div>\n          <div class="prop-value">',model.errorCode?t("xiconf","error:"+model.errorCode):"-",'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:exception"),'</div>\n          <div class="prop-value">',escape(model.exception||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:workflowFile"),'</div>\n          <div class="prop-value">',escape(model.workflowPath||"-"),'</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">',t("xiconf","PROPERTY:featureFile"),'</div>\n          <div class="prop-value">',escape(model.featurePath||"-"),'</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="xiconf-tabs">\n    <ul class="nav nav-tabs">\n      <li data-tab="log"><a href="#',idPrefix,'-log" data-toggle="tab">',t("xiconf","tab:log"),"</a></li>\n      "),model.output&&buf.push('\n      <li data-tab="output"><a href="#',idPrefix,'-output" data-toggle="tab">',t("xiconf","tab:output"),"</a></li>\n      "),buf.push("\n      "),model.workflow&&buf.push('\n      <li data-tab="workflow"><a href="#',idPrefix,'-workflow" data-toggle="tab">',t("xiconf","tab:workflow"),"</a></li>\n      "),buf.push("\n      "),model.feature&&buf.push('\n      <li data-tab="feature"><a href="#',idPrefix,'-feature" data-toggle="tab">',t("xiconf","tab:feature"),"</a></li>\n      "),buf.push("\n      "),model.program&&buf.push('\n      <li data-tab="program"><a href="#',idPrefix,'-program" data-toggle="tab">',t("xiconf","tab:program"),"</a></li>\n      "),buf.push('\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane" id="',idPrefix,'-log">\n        <table class="table table-bordered xiconf-log">\n          <tbody>\n            '),log.forEach(function(i){buf.push('\n            <tr>\n              <td><time datetime="',i.datetime,'">',i.time,"</time></td>\n              <td>",i.text,"</td>\n            </tr>\n            ")}),buf.push("\n          </tbody>\n        </table>\n      </div>\n      "),model.output&&buf.push('\n      <div class="tab-pane" id="',idPrefix,'-output"><pre><code>',escape(model.output||"-"),"</code></pre></div>\n      "),buf.push("\n      "),model.workflow&&buf.push('\n      <div class="tab-pane" id="',idPrefix,'-workflow"><pre><code>',escape(model.workflow||"-"),"</code></pre></div>\n      "),buf.push("\n      "),model.feature&&buf.push('\n      <div class="tab-pane" id="',idPrefix,'-feature"><pre><code class="xml">',escape(model.feature||"-"),"</code></pre></div>\n      "),buf.push("\n      "),model.program&&buf.push('\n      <div class="tab-pane" id="',idPrefix,'-program">\n        <div class="xiconf-details-steps"></div>\n        <div class="xiconf-details-metrics"></div>\n      </div>\n      '),buf.push("\n    </div>\n  </div>\n</div>\n")}();return buf.join("")}});