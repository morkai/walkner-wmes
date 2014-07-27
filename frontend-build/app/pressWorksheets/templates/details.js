define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div>\n  <div class="panel panel-primary pressWorksheets-details">\n    <div class="panel-heading">\n      ',t("pressWorksheets","PANEL:TITLE:details"),'\n    </div>\n    <div class="panel-details row">\n      <div class="col-md-6">\n        <div class="props first">\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:type"),'</div>\n            <div class="prop-value">',model.type,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:date"),'</div>\n            <div class="prop-value">',model.date,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:shift"),'</div>\n            <div class="prop-value">',model.shift,'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:master"),'</div>\n            <div class="prop-value">',escape(model.master||"-"),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:operator"),'</div>\n            <div class="prop-value">',escape(model.operator||"-"),'</div>\n          </div>\n        </div>\n      </div>\n      <div class="col-md-6">\n        <div class="props">\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:createdAt"),'</div>\n            <div class="prop-value">',escape(model.createdAt||"-"),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:creator"),'</div>\n            <div class="prop-value">',escape(model.creator||"-"),'</div>\n          </div>\n          <div class="prop">\n            <div class="prop-name">',t("pressWorksheets","PROPERTY:operators"),'</div>\n            <div class="prop-value">\n              '),model.operators.length?(buf.push("\n              <ol>\n                "),model.operators.forEach(function(e){buf.push("\n                <li>",escape(e),"</li>\n                ")}),buf.push("\n              </ol>\n              ")):buf.push("\n              -\n              "),buf.push('\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default pressWorksheets-details-orders">\n    <div class="panel-heading">\n      ',t("pressWorksheets","PANEL:TITLE:details:orders"),'\n    </div>\n    <table class="table table-bordered table-condensed">\n      <thead>\n        <tr>\n          <th>',t("pressWorksheets","PROPERTY:order.nc12"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.name"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.operationName"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.operationNo"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.prodLine"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.quantityDone"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.startedAt"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.finishedAt"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.losses"),"</th>\n          <th>",t("pressWorksheets","PROPERTY:order.downtimes"),"</th>\n        </tr>\n      </thead>\n      <tbody>\n        "),model.orders.forEach(function(e){buf.push("\n        <tr>\n          <td>\n            "),e.prodShiftOrder&&user.isAllowedTo("PROD_DATA:VIEW")?buf.push('\n            <a href="#prodShiftOrders/',e.prodShiftOrder,'">',escape(e.nc12),"</a>\n            "):buf.push("\n            ",escape(e.nc12),"\n            "),buf.push("\n          </td>\n          <td>",escape(e.name),"</td>\n          <td>",escape(e.operationName||"-"),"</td>\n          <td>",escape(e.operationNo),"</td>\n          <td>",escape(e.prodLine),"</td>\n          <td>",escape(e.quantityDone),"</td>\n          <td>",escape(e.startedAt),"</td>\n          <td>",escape(e.finishedAt),'</td>\n          <td class="prodWorksheets-details-tableContainer">\n            '),e.losses.length&&(buf.push('\n            <table class="table table-bordered table-condensed">\n              <thead>\n                <tr>\n                  '),e.losses.forEach(function(e){buf.push("\n                  <th>",escape(e.label),"</th>\n                  ")}),buf.push("\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  "),e.losses.forEach(function(e){buf.push("\n                  <td>",escape(e.count),"</td>\n                  ")}),buf.push("\n                </tr>\n              </tbody>\n            </table>\n            ")),buf.push('\n          </td>\n          <td class="prodWorksheets-details-tableContainer">\n            '),e.downtimes.length&&(buf.push('\n            <table class="table table-bordered table-condensed">\n              <thead>\n                <tr>\n                  '),e.downtimes.forEach(function(e){buf.push("\n                  <th>\n                    "),e.prodDowntime&&user.isAllowedTo("PROD_DOWNTIMES:VIEW")?buf.push('\n                    <a href="#prodDowntimes/',e.prodDowntime,'">',escape(e.label),"</a>\n                    "):buf.push("\n                    ",escape(e.label),"\n                    "),buf.push("\n                  </th>\n                  ")}),buf.push("\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  "),e.downtimes.forEach(function(e){buf.push("\n                  <td>",escape(e.duration),"</td>\n                  ")}),buf.push("\n                </tr>\n              </tbody>\n            </table>\n            ")),buf.push("\n          </td>\n        </tr>\n        ")}),buf.push("\n      </tbody>\n    </table>\n  </div>\n</div>\n")}();return buf.join("")}});