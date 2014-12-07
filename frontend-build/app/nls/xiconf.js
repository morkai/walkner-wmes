define(["app/nls/locale/en"],function(r){var n={lc:{pl:function(n){return r(n)},en:function(n){return r(n)}},c:function(r,n){if(!r)throw new Error("MessageFormat: Data required for '"+n+"'.")},n:function(r,n,e){if(isNaN(r[n]))throw new Error("MessageFormat: '"+n+"' isn't a number.");return r[n]-(e||0)},v:function(r,e){return n.c(r,e),r[e]},p:function(r,e,o,t,i){return n.c(r,e),r[e]in i?i[r[e]]:(e=n.lc[t](r[e]-o),e in i?i[e]:i.other)},s:function(r,e,o){return n.c(r,e),r[e]in o?o[r[e]]:o.other}};return{root:{"BREADCRUMBS:browse":function(){return"Xiconf results"},"BREADCRUMBS:details":function(){return"Result"},"MSG:LOADING_FAILURE":function(){return"Failed to load the programming results :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the programming result :("},"PANEL:TITLE:details:order":function(){return"Order details"},"PANEL:TITLE:details:entry":function(){return"Programming details"},"PAGE_ACTION:export":function(){return"Export results"},"PAGE_ACTION:download":function(){return"Download configuration"},"PAGE_ACTION:download:workflow":function(){return"Programmer configuration"},"PAGE_ACTION:download:feature":function(){return"Driver configuration"},"PROPERTY:srcId":function(){return"Installation ID"},"PROPERTY:srcTitle":function(){return"Installation title"},"PROPERTY:srcIp":function(){return"Installation IP"},"PROPERTY:srcUuid":function(){return"Installation key"},"PROPERTY:no":function(){return"Order no"},"PROPERTY:totalCounter":function(){return"Total programming attemps"},"PROPERTY:successCounter":function(){return"Successful programming attempts"},"PROPERTY:failureCounter":function(){return"Failed programming attempts"},"PROPERTY:order":function(){return"Order"},"PROPERTY:quantity":function(){return"Quantity"},"PROPERTY:counter":function(){return"Counter"},"PROPERTY:nc12":function(){return"12NC"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:log":function(){return"Log"},"PROPERTY:result":function(){return"Result"},"PROPERTY:errorCode":function(){return"Error"},"PROPERTY:exception":function(){return"Exception"},"PROPERTY:output":function(){return"Programmer output"},"PROPERTY:featureFile":function(){return"Driver configuration file"},"PROPERTY:featureFileName":function(){return"Driver configuration file name"},"PROPERTY:feature":function(){return"Driver configuration file contents"},"PROPERTY:workflowFile":function(){return"Programmer configuration file"},"PROPERTY:workflow":function(){return"Programmer configuration file contents"},"PROPERTY:programName":function(){return"Program name"},"filter:result:success":function(){return"Success"},"filter:result:failure":function(){return"Failure"},"filter:placeholder:srcId":function(){return"Any"},"filter:submit":function(){return"Filter results"},"tab:log":function(){return"Programming log"},"tab:output":function(){return"Programmer output"},"tab:workflow":function(){return"Programmer configuration"},"tab:feature":function(){return"Driver configuration"},"log:ORDER_CREATED":function(r){return"Starting a new order no <code>"+n.v(r,"orderNo")+"</code> (1/"+n.v(r,"quantity")+")..."},"log:ORDER_CONTINUED":function(r){return"Continuuing an existing order no <code>"+n.v(r,"orderNo")+"</code> ("+n.v(r,"counter")+"/"+n.v(r,"quantity")+")..."},"log:PROGRAMMING_STARTED":function(r){return"Starting a programming of the 12NC <code>"+n.v(r,"nc12")+"</code>..."},"log:COUNTDOWN_STARTED":function(r){return"Counting down <code>"+n.v(r,"delay")+"</code> "+n.p(r,"delay",0,"en",{one:"second",other:"seconds"})+"..."},"log:READING_WORKFLOW_FILE":function(r){return"Reading contents of the programmer configuration file: <code>"+n.v(r,"workflowFile")+"</code>"},"log:WORKFLOW_FILE_READ":function(r){return"Read <code>"+n.v(r,"length")+"B</code> of the programmer configuration file."},"log:SEARCHING_FEATURE_FILE":function(r){return"Searching for a driver configuration file in path: <code>"+n.v(r,"featurePath")+"</code>"},"log:SEARCHING_FEATURE_FILE_FAILURE":function(r){return"Driver configuration file searching failed: <code>"+n.v(r,"error")+"</code>"},"log:SEARCHING_FEATURE_FILE_TIMEOUT":function(){return"Driver configuration file searching timed out."},"log:MISSING_FEATURE_FILE_1":function(){return"Driver configuration file was not found in the first path."},"log:MISSING_FEATURE_FILE_2":function(){return"Driver configuration file was not found in the backup path."},"log:DUPLICATE_FEATURE_FILE_1":function(r){return"Found "+n.v(r,"fileCount")+" driver configuration "+n.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the first path."},"log:DUPLICATE_FEATURE_FILE_2":function(r){return"Found "+n.v(r,"fileCount")+" driver configuration "+n.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the backup path."},"log:FEATURE_FILE_FOUND":function(r){return"Found the driver configuration file: <code>"+n.v(r,"featureFile")+"</code>"},"log:SKIPPING_FEATURE_FILE_2":function(){return"Skipping searching for the driver configuration file in the backup path..."},"log:CANCELLING":function(){return"Cancelling the programming..."},"log:PROGRAMMING_SUCCESS":function(r){return"Successfully finished the programming of the 12NC <code>"+n.v(r,"nc12")+"</code> in <code>"+n.v(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Finished the programming of the 12NC <code>"+n.v(r,"nc12")+"</code> in <code>"+n.v(r,"duration")+"</code> with an error: <code>"+n.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE":function(){return"Reading contents of the driver configuration file..."},"log:READING_FEATURE_FILE_FAILURE":function(r){return"Reading contents of the driver configuration file failed: <code>"+n.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading contents of the driver configuration file timed out."},"log:FEATURE_FILE_READ":function(r){return"Read <code>"+n.v(r,"length")+"B</code> of the driver configuration file."},"log:STARTING_PROGRAMMER":function(r){return"Starting the programmer using the <code>"+n.s(r,"interface",{d:"DALI",z:"ZigBee",i:"IP",other:"?"})+"</code> interface: <code>"+n.v(r,"programmerFile")+"</code>"},"log:SOL_STARTED":function(){return"Starting a Fortimo Solar programming..."},"log:SOL_PARSE_ERROR":function(r){return"Error during a parsing of the program file in line <code>"+n.v(r,"i")+"</code>: <code>"+n.v(r,"line")+"</code>"},"log:SOL_SEARCHING_COM":function(r){return"Searching for a serial port using matching the pattern: <code>"+n.v(r,"pattern")+"</code>..."},"log:SOL_OPENING_COM":function(r){return"Opening the <code>"+n.v(r,"comPort")+"</code> serial port..."},"log:SOL_EXECUTING_SET_COMMANDS":function(r){return"Executing "+n.p(r,"count",0,"en",{one:"<code>1</code> SET parameter value command",other:"<code>"+n.v(r,"count")+"</code> SET parameter value commands"})+"..."},"log:SOL_RESETTING":function(){return"Resetting the device..."},"log:SOL_EXECUTING_GET_COMMANDS":function(){return"Comparing the programmed parameter values..."},"log:SOL_INVALID_OPTION":function(r){return"Read parameter value of option <code>"+n.v(r,"option")+"</code> differs from the programmed value (expected <code>"+n.v(r,"expected")+"</code>; got <code>"+n.v(r,"actual")+"</code>)."},"error:WORKFLOW_FILE_ERROR":function(){return"Error during reading of the contents of the programmer configuration file."},"error:FEATURE_FILE_ERROR":function(){return"Error during reading of the contents of the driver configuration file."},"error:UNSET_WORKFLOW_FILE":function(){return"Path to the programmer configuration file was not set."},"error:UNSET_FEATURE_PATH_1":function(){return"First path to the driver configuration files was not set."},"error:UNSET_PROGRAMMER_FILE":function(){return"Path to the programmer executable file was not set."},"error:MISSING_WORKFLOW_FILE":function(){return"Programmer configuration file was not found."},"error:MISSING_FEATURE_FILE":function(){return"Driver configuration file was not found."},"error:DUPLICATE_FEATURE_FILE":function(){return"Detected multiple driver configuration files for the specified 12NC."},"error:CANCELLED":function(){return"Programming cancelled."},"error:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading of the contents of the driver configuration file timed out."},"error:MISSING_PROGRAMMER_FILE":function(){return"Programmer executable file was not found."},"error:PROGRAMMER_FILE_ERROR":function(){return"Error during running of the programmer executable file."},"error:EXIT_CODE:-1":function(){return"MultiOneWorkflow (-1): general application failure."},"error:EXIT_CODE:4":function(){return"MultiOneWorkflow (4): verification failed."},"error:EXIT_CODE:9":function(){return"MultiOneWorkflow (9): workflow configuration file not found."},"error:EXIT_CODE:10":function(){return"MultiOneWorkflow (10): workflow configuration file not valid."},"error:EXIT_CODE:101":function(){return"MultiOneWorkflow (101): there are no features to write."},"error:EXIT_CODE:200":function(){return"MultiOneWorkflow (200): feature file not present."},"error:EXIT_CODE:201":function(){return"MultiOneWorkflow (201): invalid feature configuration file."},"error:EXIT_CODE:202":function(){return"MultiOneWorkflow (202): feature configuration file is null or empty."},"error:EXIT_CODE:203":function(){return"MultiOneWorkflow (203): feature configuration file contains duplicate features."},"error:EXIT_CODE:300":function(){return"MultiOneWorkflow (300): the device does not support all features from the feature configuration file."},"error:EXIT_CODE:500":function(){return"MultiOneWorkflow (500): no device found."},"error:EXIT_CODE:501":function(){return"MultiOneWorkflow (501): too many devices found."},"error:EXIT_CODE:502":function(){return"MultiOneWorkflow (502): unable to execute discover."},"error:EXIT_CODE:503":function(){return"MultiOneWorkflow (503): multiple devices share the same short address."},"error:EXIT_CODE:600":function(){return"MultiOneWorkflow (600): no features to convert."},"error:EXIT_CODE:700":function(){return"MultiOneWorkflow (700): no interface connected."},"error:EXIT_CODE:800":function(){return"MultiOneWorkflow (800): convert feature data is not possible."},"error:SOL_PARSE_ERROR":function(){return"SOL: Error during parsing of the program file."},"error:SOL_NO_COMMANDS":function(){return"SOL: No SET commands were found in the program file."},"error:SOL_SEARCHING_COM_FAILURE":function(){return"SOL: Error while searching for a serial port."},"error:SOL_COM_NOT_FOUND":function(){return"SOL: Serial port was not found."},"error:SOL_OPENING_COM_FAILURE":function(){return"SOL: Error while opening the serial port."},"error:SOL_SERIAL_PORT_FAILURE":function(){return"SOL: Serial port error."},"error:SOL_NO_CONNECTION":function(){return"SOL: No response from the device. Check the serial port connection."},"error:SOL_INVALID_OPTION":function(){return"SOL: Read value differs from the programmed one."}},pl:!0}});