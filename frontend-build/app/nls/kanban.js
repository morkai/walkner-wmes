define(["app/nls/locale/en"],function(n){var t={lc:{pl:function(t){return n(t)},en:function(t){return n(t)}},c:function(n,t){if(!n)throw new Error("MessageFormat: Data required for '"+t+"'.")},n:function(n,t,e){if(isNaN(n[t]))throw new Error("MessageFormat: '"+t+"' isn't a number.");return n[t]-(e||0)},v:function(n,e){return t.c(n,e),n[e]},p:function(n,e,r,o,i){return t.c(n,e),n[e]in i?i[n[e]]:(e=t.lc[o](n[e]-r))in i?i[e]:i.other},s:function(n,e,r){return t.c(n,e),n[e]in r?r[n[e]]:r.other}};return{root:{"bc:base":function(n){return"Component DB"},"bc:settings":function(n){return"Settings"},"msg:update:failure":function(n){return"Failed to change the value."},"msg:clipboard:cell":function(n){return"Cell copied to clipboard."},"msg:clipboard:row":function(n){return"Row copied to clipboard."},"msg:clipboard:table":function(n){return"Table copied to clipboard."},"msg:import:started":function(n){return"Import started..."},"msg:import:failure":function(n){return"Import failed."},"msg:import:success":function(n){return"Imported."},"msg:import:IN_PROGRESS":function(n){return"Import in progress..."},"msg:import:DISABLED":function(n){return"Importing disabled."},"msg:discontinued":function(n){return"CCN "+t.v(n,"id")+" is discontinued."},"pa:lastImport":function(n){return"Last import at:<br>"+t.v(n,"importedAt")},"pa:import":function(n){return"Import"},"pa:import:sap":function(n){return"Import data from SAP"},"pa:import:entries":function(n){return"Import CCN from file"},"pa:import:components":function(n){return"Import components from file"},"pa:dictionaries":function(n){return"Dictionaries"},"pa:components":function(n){return"Components"},"pa:supplyAreas":function(n){return"Supply areas"},"pa:containers":function(n){return"Containers"},"pa:settings":function(n){return"Settings"},"pa:printQueues":function(n){return"Print queues"},"menu:sort:asc":function(n){return"Sort ascending"},"menu:sort:desc":function(n){return"Sort descending"},"menu:hide":function(n){return"Hide column"},"menu:show":function(n){return"Show columns..."},"menu:filter:and":function(n){return"All conditions"},"menu:filter:or":function(n){return"Any condition"},"menu:filter:clear":function(n){return"Clear all filters"},"menu:copy:table":function(n){return"Copy table"},"menu:copy:row":function(n){return"Copy row"},"menu:copy:cell":function(n){return"Copy cell"},"menu:export":function(n){return"Export table"},"menu:edit":function(n){return"Edit cell"},"menu:queuePrint":function(n){return"Print labels"},"menu:containerImage":function(n){return"Open image"},"menu:nc12:orders":function(n){return"Production orders"},"menu:nc12:pfep":function(n){return"PFEP DB"},"menu:nc12:pfep:notFound":function(n){return"12NC not found in the PFEP DB."},"column:_id":function(n){return"CCN"},"column:nc12":function(n){return"12NC"},"column:description":function(n){return"Component name"},"column:supplyArea":function(n){return"Supply<br>area"},"column:storageType":function(n){return"Strategy"},"column:workCenter":function(n){return"WorkCenter"},"column:line":function(n){return"Line"},"column:family":function(n){return"Family"},"column:kanbanQtyUser":function(n){return"Kanban count<br>per line"},"column:kanbanQtyUser:title":function(n){return"Kanban count per line"},"column:componentQty":function(n){return"Component quantity<br>in kanban"},"column:componentQty:title":function(n){return"Component quantity in kanban"},"column:storageBin":function(n){return"Storage<br>bin<br>(SAP)"},"column:storageBin:title":function(n){return"Storage bin (SAP)"},"column:newStorageBin":function(n){return"Storage<br>bin<br>(new)"},"column:newStorageBin:title":function(n){return"Storage bin (new)"},"column:kanbanId":function(n){return"Kanban<br>ID"},"column:kanbanIdCount":function(n){return"Kanban ID<br>count in SAP"},"column:kanbanIdCount:title":function(n){return"Kanban ID count in SAP"},"column:lineCount":function(n){return"Line count"},"column:lineCount:title":function(n){return"Line count"},"column:emptyFullCount":function(n){return"Kanban count<br>for all lines"},"column:emptyFullCount:title":function(n){return"Kanban count for all lines"},"column:stock":function(n){return"Stock"},"column:stock:title":function(n){return"Stock"},"column:maxBinQty":function(n){return"Max bin<br>quantity"},"column:maxBinQty:title":function(n){return"Maximum bin quantity"},"column:minBinQty":function(n){return"Min bin<br>quantity"},"column:minBinQty:title":function(n){return"Minimum bin quantity"},"column:replenQty":function(n){return"Replenishment<br>quantity"},"column:replenQty:title":function(n){return"Replenishment quantity"},"column:kind":function(n){return"Kanban kind"},"column:container":function(n){return"Container<br>kind"},"column:workstations":function(n){return"Workstations"},"column:workstation:title":function(n){return"Workstation "+t.v(n,"n")},"column:workstationsN":function(n){return"Workstation "+t.v(n,"n")},"column:locations":function(n){return"Locations on line"},"column:location:title":function(n){return"Location online - Workstation "+t.v(n,"n")},"column:locationsN":function(n){return"Location "+t.v(n,"n")},"column:discontinued":function(n){return"Discontinued?"},"column:discontinued:title":function(n){return"Discontinued?"},"column:comment":function(n){return"Comment"},"column:markerColor":function(n){return"Color (SAP)"},"column:markerColor:title":function(n){return"Marker color (SAP)"},"column:newMarkerColor":function(n){return"Color (new)"},"column:newMarkerColor:title":function(n){return"Marker color (newt)"},"export:fileName":function(n){return"WMES_KANBAN"},"export:sheetName":function(n){return"Kanban DB"},"export:progress":function(n){return"Exporting the table..."},"export:failure":function(n){return"Failed to export the table."},"kind:kk":function(n){return"Kanban Card"},"kind:pk":function(n){return"Kanban Container"},"kind:null":function(n){return"Unspecified"},"kind:kk:short":function(n){return"KC"},"kind:pk:short":function(n){return"CK"},"kind:null:short":function(n){return""},"container:null":function(n){return"Unspecified"},"workCenter:null":function(n){return"Unspecified"},"filters:submit":function(n){return"Filter"},"filters:clear":function(n){return"Clear"},"filters:noValue":function(n){return"No value"},"filters:value:empty":function(n){return"No value"},"filters:value:valid":function(n){return"Valid values"},"filters:value:invalid":function(n){return"Invalid values"},"filters:invalid":function(n){return"Invalid filter."},"filters:help:title:text":function(n){return"Text filter"},"filters:help:title:numeric":function(n){return"Numeric filter"},"filters:help:title:select-one":function(n){return"Single choice filter"},"filters:help:title:select-multi":function(n){return"Multiple choice filter"},"filters:help:content:text":function(n){return"<p>Specify an alphanumeric string that must be present in the text value. Letter casing and word order doesn't matter. For example: <code>mtf scr</code></p><p>A regular expression can be used as as filter. For example: <code>/^band/</code>, will select values starting with <code>band</code>.</p><p>Enter <code>?</code> to select only the empty values or <code>!</code> to select only the non-empty values.</p>"},"filters:help:content:numeric":function(n){return"<p>Specifiy a single number to select rows equal to the specified value.</p><p>One of the following conditions can be specified before the number: <code>=</code> equals to, <code>&lt;&gt;</code> not equals to, <code>&gt;</code>, <code>&gt=</code>, <code>&lt;</code> and <code>&lt;=</code>, for example: <code>>= 1337</code>.</p><p>The filter also accepts a complex condition, containing brackets and logical operators <code>and</code> and <code>or</code>. <code>$</code> should be used as the cell's value, for example:<br><code>$ = 100 or ($ > 200 and $ < 300)</code>.</p><p>Enter <code>?</code>, to select only zeros or <code>!</code>, to select only non-zeros.</p>"},"filters:help:content:select-one":function(n){return"<p>Select a single option from the list by clicking on it.</p><p>To deselect a value, <i class='fa fa-times'></i> clear the filter.</p>"},"filters:help:content:select-multi":function(n){return"<p>Select a single option from the list by clicking on it (LMB).</p><p>To select multiple options, use LPM while holding <kbd>Ctrl</kbd>.</p><p>To deselect chosen values, <i class='fa fa-times'></i> clear the filter.</p>"},"filters:kanbanIds:invalid":function(n){return"Invalid"},"filters:kanbanIds:tooFew":function(n){return"Too few"},"filters:kanbanIds:tooMany":function(n){return"Too many"},"search:invalid":function(n){return"Enter CCN or 12NC."},"search:invalid:ccn":function(n){return"CCN not found."},"search:invalid:nc12":function(n){return"12NC not found."},"builder:title":function(n){return"New print queue"},"builder:addAll":function(n){return"Add all"},"builder:no":function(n){return"#"},"builder:ccn":function(n){return"CCN"},"builder:lines":function(n){return"Lines"},"builder:lines:all":function(n){return"All"},"builder:kk":function(n){return"KC"},"builder:empty":function(n){return"Empty"},"builder:full":function(n){return"Full"},"builder:wh":function(n){return"WH"},"builder:desc":function(n){return"Desc."},"builder:error:noLayout":function(n){return"Select at least one layout."},"builder:error:noKind":function(n){return"Unrecognized kanban kind."},"builder:error:noKanbanId":function(n){return"No kanban ID for line "+t.v(n,"line")+" (position "+t.v(n,"i")+")."},"builder:submit":function(n){return"Add new print queue"},"builder:remove":function(n){return"Remove CCN"},"builder:clear":function(n){return"Clear all"},"builder:newStorageBin":function(n){return"Use the new storage bin"},"import:components:title":function(n){return"Importing components"},"import:components:file":function(n){return"File to import"},"import:components:submit":function(n){return"Import data"},"import:components:cancel":function(n){return"Cancel"},"import:components:message":function(n){return"<p>The first sheet in the file should contain column names in the first row, and component data in the next ones.</p><p>Expected column names are:</p><ul><li><code>12NC</code> (required)<li><code>Lok*nowa*</code> - storage bin (new)</ul>"},"import:entries:title":function(n){return"Importing CCN"},"import:entries:file":function(n){return"File to import"},"import:entries:submit":function(n){return"Import data"},"import:entries:cancel":function(n){return"Cancel"},"import:entries:message":function(n){return"<p>The first sheet in the file should contain column names in the first row, and CCN data in the next ones.</p><p>Expected column names are:</p><ul><li><code>CCN</code> (required)<li><code>*pojemnik*</code> - container kind<li><code>*rodzaj*</code> - kanban kind<li><code>*wycof*</code> - discontinued<li><code>LSTn</code> - location n<li><code>STn</code> - workstation n</ul>"},"settings:tab:import":function(n){return"Importing"},"settings:import:maktLanguage":function(n){return"MAKT: Language"},"settings:import:mlgtStorageType":function(n){return"MLGT: Storage type"},"settings:import:mlgtWarehouseNo":function(n){return"MLGT: Warehouse no"},"settings:import:pkhdStorageType":function(n){return"PKHD: Storage type"},"color:null":function(n){return"Unspecified"},"color:darkblue":function(n){return"Dark blue"},"color:violet":function(n){return"Violet"},"color:lavender":function(n){return"Lavender"},"color:lightblue":function(n){return"Light blue"},"color:grey":function(n){return"Grey"},"color:red":function(n){return"Red"},"color:orange":function(n){return"Orange"},"color:yellow":function(n){return"Yellow"},"color:sand":function(n){return"Sand"},"color:green":function(n){return"Green"},"color:lightgreen":function(n){return"Light green"},"color:pink":function(n){return"Pink"},"color:brown":function(n){return"Brown"},"color:cyan":function(n){return"Cyan"},"color:black":function(n){return"Black"}},pl:!0}});