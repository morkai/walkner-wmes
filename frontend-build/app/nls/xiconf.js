define(["app/nls/locale/en"],function(r){var n={locale:{}};n.locale.en=r;var e=function(r){if(!r)throw new Error("MessageFormat: No data passed to function.")},o=function(r,n){return e(r),r[n]},t=function(r,o,t,i,u){return e(r),r[o]in u?u[r[o]]:(o=n.locale[i](r[o]-t),o in u?u[o]:u.other)},i=function(r,n,o){return e(r),r[n]in o?o[r[n]]:o.other};return{root:{"BREADCRUMBS:browse":function(){return"Programming results"},"BREADCRUMBS:details":function(){return"Result"},"MSG:LOADING_FAILURE":function(){return"Failed to load the programming results :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the programming result :("},"PANEL:TITLE:details:order":function(){return"Order details"},"PANEL:TITLE:details:entry":function(){return"Programming details"},"PAGE_ACTION:export":function(){return"Export results"},"PAGE_ACTION:download":function(){return"Download configuration"},"PAGE_ACTION:download:workflow":function(){return"Programmer configuration"},"PAGE_ACTION:download:feature":function(){return"Driver configuration"},"PROPERTY:srcId":function(){return"Installation ID"},"PROPERTY:srcTitle":function(){return"Installation title"},"PROPERTY:srcIp":function(){return"Installation IP"},"PROPERTY:srcUuid":function(){return"Installation key"},"PROPERTY:no":function(){return"Order no"},"PROPERTY:totalCounter":function(){return"Total programming attemps"},"PROPERTY:successCounter":function(){return"Successful programming attempts"},"PROPERTY:failureCounter":function(){return"Failed programming attempts"},"PROPERTY:order":function(){return"Order"},"PROPERTY:quantity":function(){return"Quantity"},"PROPERTY:counter":function(){return"Counter"},"PROPERTY:nc12":function(){return"12NC"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:log":function(){return"Log"},"PROPERTY:result":function(){return"Result"},"PROPERTY:errorCode":function(){return"Error"},"PROPERTY:exception":function(){return"Exception"},"PROPERTY:output":function(){return"MultiOne Workflow output"},"PROPERTY:featureFile":function(){return"Driver configuration file"},"PROPERTY:featureFileName":function(){return"Driver configuration file name"},"PROPERTY:feature":function(){return"Driver configuration file contents"},"PROPERTY:workflowFile":function(){return"Programmer configuration file"},"PROPERTY:workflow":function(){return"Programmer configuration file contents"},"PROPERTY:programName":function(){return"Program name"},"FILTER:from":function(){return"From"},"FILTER:to":function(){return"To"},"FILTER:result:success":function(){return"Success"},"FILTER:result:failure":function(){return"Failure"},"FILTER:PLACEHOLDER:srcId":function(){return"Any"},"FILTER:limit":function(){return"Limit"},"FILTER:submit":function(){return"Filter results"},"tab:log":function(){return"Programming log"},"tab:output":function(){return"MultiOne Workflow output"},"tab:workflow":function(){return"Programmer configuration"},"tab:feature":function(){return"Driver configuration"},"log:ORDER_CREATED":function(r){return"Starting a new order no <code>"+o(r,"orderNo")+"</code> (1/"+o(r,"quantity")+")..."},"log:ORDER_CONTINUED":function(r){return"Continuuing an existing order no <code>"+o(r,"orderNo")+"</code> ("+o(r,"counter")+"/"+o(r,"quantity")+")..."},"log:PROGRAMMING_STARTED":function(r){return"Starting a programming of the 12NC <code>"+o(r,"nc12")+"</code>..."},"log:COUNTDOWN_STARTED":function(r){return"Counting down <code>"+o(r,"delay")+"</code> "+t(r,"delay",0,"en",{one:"second",other:"seconds"})+"..."},"log:READING_WORKFLOW_FILE":function(r){return"Reading contents of the programmer configuration file: <code>"+o(r,"workflowFile")+"</code>"},"log:WORKFLOW_FILE_READ":function(r){return"Read <code>"+o(r,"length")+"B</code> of the programmer configuration file."},"log:SEARCHING_FEATURE_FILE":function(r){return"Searching for a driver configuration file in path: <code>"+o(r,"featurePath")+"</code>"},"log:SEARCHING_FEATURE_FILE_FAILURE":function(r){return"Driver configuration file searching failed: <code>"+o(r,"error")+"</code>"},"log:SEARCHING_FEATURE_FILE_TIMEOUT":function(){return"Driver configuration file searching timed out."},"log:MISSING_FEATURE_FILE_1":function(){return"Driver configuration file was not found in the first path."},"log:MISSING_FEATURE_FILE_2":function(){return"Driver configuration file was not found in the backup path."},"log:DUPLICATE_FEATURE_FILE_1":function(r){return"Found "+o(r,"fileCount")+" driver configuration "+t(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the first path."},"log:DUPLICATE_FEATURE_FILE_2":function(r){return"Found "+o(r,"fileCount")+" driver configuration "+t(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the backup path."},"log:FEATURE_FILE_FOUND":function(r){return"Found the driver configuration file: <code>"+o(r,"featureFile")+"</code>"},"log:SKIPPING_FEATURE_FILE_2":function(){return"Skipping searching for the driver configuration file in the backup path..."},"log:CANCELLING":function(){return"Cancelling the programming..."},"log:PROGRAMMING_SUCCESS":function(r){return"Successfully finished the programming of the 12NC <code>"+o(r,"nc12")+"</code> in <code>"+o(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Finished the programming of the 12NC <code>"+o(r,"nc12")+"</code> in <code>"+o(r,"duration")+"</code> with an error: <code>"+o(r,"error")+"</code>"},"log:READING_FEATURE_FILE":function(){return"Reading contents of the driver configuration file..."},"log:READING_FEATURE_FILE_FAILURE":function(r){return"Reading contents of the driver configuration file failed: <code>"+o(r,"error")+"</code>"},"log:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading contents of the driver configuration file timed out."},"log:FEATURE_FILE_READ":function(r){return"Read <code>"+o(r,"length")+"B</code> of the driver configuration file."},"log:STARTING_PROGRAMMER":function(r){return"Starting the programmer using the <code>"+i(r,"interface",{d:"DALI",z:"ZigBee",i:"IP",other:"?"})+"</code> interface: <code>"+o(r,"programmerFile")+"</code>"},"error:WORKFLOW_FILE_ERROR":function(){return"Error during reading of the contents of the programmer configuration file."},"error:FEATURE_FILE_ERROR":function(){return"Error during reading of the contents of the driver configuration file."},"error:UNSET_WORKFLOW_FILE":function(){return"Path to the programmer configuration file was not set."},"error:UNSET_FEATURE_PATH_1":function(){return"First path to the driver configuration files was not set."},"error:UNSET_PROGRAMMER_FILE":function(){return"Path to the programmer executable file was not set."},"error:MISSING_WORKFLOW_FILE":function(){return"Programmer configuration file was not found."},"error:MISSING_FEATURE_FILE":function(){return"Driver configuration file was not found."},"error:DUPLICATE_FEATURE_FILE":function(){return"Detected multiple driver configuration files for the specified 12NC."},"error:CANCELLED":function(){return"Programming cancelled."},"error:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading of the contents of the driver configuration file timed out."},"error:MISSING_PROGRAMMER_FILE":function(){return"Programmer executable file was not found."},"error:PROGRAMMER_FILE_ERROR":function(){return"Error during running of the programmer executable file."},"error:EXIT_CODE:-1":function(){return"MultiOneWorkflow (-1): general application failure."},"error:EXIT_CODE:4":function(){return"MultiOneWorkflow (4): verification failed."},"error:EXIT_CODE:9":function(){return"MultiOneWorkflow (9): workflow configuration file not found."},"error:EXIT_CODE:10":function(){return"MultiOneWorkflow (10): workflow configuration file not valid."},"error:EXIT_CODE:101":function(){return"MultiOneWorkflow (101): there are no features to write."},"error:EXIT_CODE:200":function(){return"MultiOneWorkflow (200): feature file not present."},"error:EXIT_CODE:201":function(){return"MultiOneWorkflow (201): invalid feature configuration file."},"error:EXIT_CODE:202":function(){return"MultiOneWorkflow (202): feature configuration file is null or empty."},"error:EXIT_CODE:203":function(){return"MultiOneWorkflow (203): feature configuration file contains duplicate features."},"error:EXIT_CODE:300":function(){return"MultiOneWorkflow (300): the device does not support all features from the feature configuration file."},"error:EXIT_CODE:500":function(){return"MultiOneWorkflow (500): no device found."},"error:EXIT_CODE:501":function(){return"MultiOneWorkflow (501): too many devices found."},"error:EXIT_CODE:502":function(){return"MultiOneWorkflow (502): unable to execute discover."},"error:EXIT_CODE:503":function(){return"MultiOneWorkflow (503): multiple devices share the same short address."},"error:EXIT_CODE:600":function(){return"MultiOneWorkflow (600): no features to convert."},"error:EXIT_CODE:700":function(){return"MultiOneWorkflow (700): no interface connected."},"error:EXIT_CODE:800":function(){return"MultiOneWorkflow (800): convert feature data is not possible."}},pl:!0}});