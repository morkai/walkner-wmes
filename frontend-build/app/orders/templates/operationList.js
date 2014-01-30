define(["app/i18n"],function(t){return function anonymous(locals,filters,escape,rethrow){escape=escape||function(e){return String(e).replace(/&(?!#?[a-zA-Z0-9]+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#39;").replace(/"/g,"&quot;")};var buf=[];with(locals||{})!function(){buf.push('<div class="panel panel-default orders-operations">\n  <div class="panel-heading">',t("orders","PANEL:TITLE:operations"),"</div>\n  "),operations.length?(buf.push('\n  <table class="table table-condensed table-hover">\n    <thead>\n      <tr>\n        <th>',t("orders","PROPERTY:operations.no"),"\n        <th>",t("orders","PROPERTY:operations.workCenter"),"\n        <th>",t("orders","PROPERTY:operations.name"),"\n        <th>",t("orders","PROPERTY:operations.qty"),"\n        <th>",t("orders","PROPERTY:operations.machineSetupTime"),"\n        <th>",t("orders","PROPERTY:operations.laborSetupTime"),"\n        <th>",t("orders","PROPERTY:operations.machineTime"),"\n        <th>",t("orders","PROPERTY:operations.laborTime"),"\n      </tr>\n    </thead>\n    <tbody>\n      "),operations.forEach(function(e){buf.push("\n      <tr>\n        <td>",escape(e.no||"-"),"\n        <td>",escape(e.workCenter||"-"),"\n        <td>",escape(e.name||"-"),"\n        <td>",escape(e.qtyUnit||"-"),"\n        <td>",escape(e.machineSetupTime||"-"),"\n        <td>",escape(e.laborSetupTime||"-"),"\n        <td>",escape(e.machineTime||"-"),"\n        <td>",escape(e.laborTime||"-"),"\n      </tr>\n      ")}),buf.push("\n    </tbody>\n  </table>\n  ")):buf.push('\n  <div class="panel-body">\n    ',t("orders","OPERATIONS:NO_DATA"),"\n  </div>\n  "),buf.push("\n</div>\n")}();return buf.join("")}});