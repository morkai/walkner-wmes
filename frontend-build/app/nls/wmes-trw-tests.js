define(["app/nls/locale/en"],function(r){var t={lc:{pl:function(t){return r(t)},en:function(t){return r(t)}},c:function(r,t){if(!r)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(r,t,n){if(isNaN(r[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return r[t]-(n||0)},v:function(r,n){return t.c(r,n),r[n]},p:function(r,n,e,o,i){return t.c(r,n),r[n]in i?i[r[n]]:(n=t.lc[o](r[n]-e))in i?i[n]:i.other},s:function(r,n,e){return t.c(r,n),r[n]in e?e[r[n]]:e.other}};return{root:{"BREADCRUMBS:base":function(r){return"TRW"},"BREADCRUMBS:browse":function(r){return"Results"},"testing:noWorkstation":function(r){return"choose workstation"},"testing:noOrder":function(r){return"choose order"},"testing:woOrder":function(r){return"no order"},"testing:noTester":function(r){return"choose tester"},"testing:noProgram":function(r){return"choose program"},"testing:menu:workstation":function(r){return"Change workstation"},"testing:menu:tester":function(r){return"Change tester"},"testing:error:setIo":function(r){return"Failed to set outputs: "+t.v(r,"error")},"testing:error:getIo":function(r){return"Failed to get inputs: "+t.v(r,"error")},"testing:error:save":function(r){return"Failed to save results: "+t.v(r,"error")},"workstationPicker:title":function(r){return"Workstation configuration"},"workstationPicker:workstation":function(r){return"Workstation number"},"workstationPicker:line":function(r){return"Production line"},"workstationPicker:submit":function(r){return"Save workstation"},"workstationPicker:cancel":function(r){return"Cancel"},"orderPicker:title":function(r){return"Choosing order"},"orderPicker:order":function(r){return"Order number"},"orderPicker:done":function(r){return"Started orders"},"orderPicker:todo":function(r){return"Planned orders"},"orderPicker:submit":function(r){return"Set order"},"orderPicker:noOrder":function(r){return"No order"},"orderPicker:cancel":function(r){return"Cancel"},"orderPicker:notFound":function(r){return"Order not found."},"programPicker:title":function(r){return"Choosing program"},"programPicker:filter":function(r){return"Filter program list"},"programPicker:programs":function(r){return"Program list"},"programPicker:submit":function(r){return"Set program"},"programPicker:cancel":function(r){return"Cancel"},"testerPicker:title":function(r){return"Choosing tester"},"testerPicker:filter":function(r){return"Filter tester list"},"testerPicker:testers":function(r){return"Tester list"},"testerPicker:submit":function(r){return"Set tester"},"testerPicker:cancel":function(r){return"Cancel"},"state:unknown":function(r){return"?"},"state:not-ready":function(r){return"<i class='fa fa-spinner fa-spin'></i>"},"state:no-connection":function(r){return"No connection to the device!"},"state:no-tester":function(r){return"Choose tester."},"state:no-program":function(r){return"Choose program."},"state:no-line":function(r){return"Choose workstation."},"state:no-order":function(r){return"Choose order."},"state:test-teardown":function(r){return"Disconnect the tested product."},"state:test-saving":function(r){return"Saving the results <i class='fa fa-spinner fa-spin'></i>"},"state:test-success":function(r){return"Test finished successfully <i class='fa fa-smile-o'></i>"},"state:step:prefix":function(r){return"Step "+t.v(r,"n")+": "}},pl:!0}});