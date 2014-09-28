define(["app/nls/locale/en"],function(r){var t={locale:{}};t.locale.en=r;var e=function(r){if(!r)throw new Error("MessageFormat: No data passed to function.")},n=function(r,t){return e(r),r[t]};return{root:{"BREADCRUMBS:browse":function(){return"ICPO results"},"BREADCRUMBS:details":function(){return"Result"},"MSG:LOADING_FAILURE":function(){return"Failed to load the programming results :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the programming result :("},"PANEL:TITLE:details":function(){return"Programming details"},"PAGE_ACTION:export":function(){return"Export results"},"PAGE_ACTION:download":function(){return"Download configuration"},"PAGE_ACTION:download:orderData":function(){return"Order configuration"},"PAGE_ACTION:download:driverData":function(){return"Driver configuration"},"PAGE_ACTION:download:gprsData":function(){return"GPRS configuration"},"PAGE_ACTION:download:inputData":function(){return"Programmer configuration"},"PAGE_ACTION:download:outputData":function(){return"Programmer result"},"PROPERTY:srcId":function(){return"Installation ID"},"PROPERTY:srcTitle":function(){return"Installation title"},"PROPERTY:srcIp":function(){return"Installation IP"},"PROPERTY:srcUuid":function(){return"Installation key"},"PROPERTY:serviceTag":function(){return"Service Tag label"},"PROPERTY:driver":function(){return"Driver label"},"PROPERTY:gprs":function(){return"GPRS label"},"PROPERTY:led":function(){return"LED board label"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:log":function(){return"Log"},"PROPERTY:result":function(){return"Result"},"PROPERTY:errorCode":function(){return"Error"},"PROPERTY:exception":function(){return"Exception"},"filter:result:success":function(){return"Success"},"filter:result:failure":function(){return"Failure"},"filter:placeholder:srcId":function(){return"Any"},"filter:submit":function(){return"Filter results"},"tab:log":function(){return"Programming log"},"tab:output":function(){return"Programmer output"},"tab:orderData":function(){return"Order"},"tab:driverData":function(){return"Driver"},"tab:gprsData":function(){return"GPRS"},"tab:inputData":function(){return"Programmer"},"tab:outputData":function(){return"Result"},"log:CANCELLING":function(){return"Cancelling..."},"log:PROGRAMMING_STARTED":function(){return"Starting a programming process..."},"log:READING_INPUT_TEMPLATE_FILE":function(r){return"Reading the programmer input template file: <code>"+n(r,"inputTemplateFile")+"</code>"},"log:READING_INPUT_TEMPLATE_FILE_SUCCESS":function(r){return"Read <code>"+n(r,"length")+"B</code> of the programmer input template file."},"log:PARSING_INPUT_TEMPLATE":function(){return"Parsing the programmer input template file..."},"log:PARSING_INPUT_TEMPLATE_SUCCESS":function(){return"Successfully parsed the programmer input template file."},"log:PREPARING_INPUT_FILE":function(){return"Preparing the programmer input file..."},"log:PREPARING_INPUT_FILE_SUCCESS":function(){return"Successfully prepared the programmer input file."},"log:PROGRAMMER_FILE_STARTED":function(r){return"Starting the programmer using the <code>"+n(r,"daliPort")+"</code> DALI port: <code>"+n(r,"programmerFile")+"</code>"},"log:PROGRAMMING_PROGRESS":function(r){return"<code>"+n(r,"percentage")+"%</code>"},"log:READING_OUTPUT_FILE":function(r){return"Reading the programmer output file: <code>"+n(r,"outputFile")+"</code>"},"log:READING_OUTPUT_FILE_SUCCESS":function(r){return"Read <code>"+n(r,"length")+"B</code> of the programmer input template file."},"log:COPYING_OUTPUT_FILE":function(){return"Copying the programmer output file..."},"log:COPYING_OUTPUT_FILE_SUCCESS":function(){return"Successfully copied the programmer output file."},"log:VERIFICATION_STARTED":function(){return"Starting the verification process..."},"log:VERIFICATION_SKIPPED":function(){return"Skipping the verification process..."},"log:PROGRAMMING_SUCCESS":function(r){return"Successfully finished the programming process in <code>"+n(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Finished the programming process in <code>"+n(r,"duration")+"</code> with an error: <code>"+n(r,"error")+"</code>"},"error:INPUT_TEMPLATE_FILE_MISSING":function(){return"Programmer input template file was not found"},"error:INPUT_TEMPLATE_FILE_FAILURE":function(){return"Error during reading of the programmer input template file."},"error:INPUT_TEMPLATE_FILE_TIMEOUT":function(){return"Reading the programmer input template file timed out."},"error:PARSING_INPUT_TEMPLATE_FAILURE":function(){return"Error during parsing of the programmer input template file."},"error:PREPARING_INPUT_FILE_FAILURE":function(){return"Error during saving of the programmer input configuration file."},"error:PROGRAMMER_FILE_UNSET":function(){return"Path to the programmer executable file was not set."},"error:PROGRAMMER_FILE_MISSING":function(){return"Programmer executable file was not found"},"error:PROGRAMMER_FILE_FAILURE":function(){return"Error during execution of the programmer executable."},"error:OUTPUT_FILE_MISSING":function(){return"Programmer output file was not found."},"error:COPYING_OUTPUT_FILE_FAILURE":function(){return"Error during copying of the programmer output file."},"error:VERIFICATION_INPUT_FAILURE":function(){return"Error during copying of the programmer output file for verification."},"error:VERIFICATION_WATCHER_FAILURE":function(){return"Error during observing of the verification directories."},"error:VERIFICATION_ERROR":function(){return"Programmer output file didn't pass the verification."},"error:VERIFICATION_TIMEOUT":function(){return"Programmer output file verification timed out."},"error:CANCELLED":function(){return"Programming cancelled."},"error:EXIT_CODE:-1":function(){return"CityTouchIPT (-1): general application failure."}},pl:!0}});