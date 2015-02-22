define(["app/nls/locale/en"],function(r){var e={lc:{pl:function(e){return r(e)},en:function(e){return r(e)}},c:function(r,e){if(!r)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(r,e,n){if(isNaN(r[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return r[e]-(n||0)},v:function(r,n){return e.c(r,n),r[n]},p:function(r,n,t,o,i){return e.c(r,n),r[n]in i?i[r[n]]:(n=e.lc[o](r[n]-t),n in i?i[n]:i.other)},s:function(r,n,t){return e.c(r,n),r[n]in t?t[r[n]]:t.other}};return{root:{"BREADCRUMBS:browse":function(){return"Xiconf results"},"BREADCRUMBS:details":function(){return"Result"},"MSG:LOADING_FAILURE":function(){return"Failed to load the programming results :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the programming result :("},"PANEL:TITLE:details:order":function(){return"Order details"},"PANEL:TITLE:details:entry":function(){return"Programming details"},"PAGE_ACTION:export":function(){return"Export results"},"PAGE_ACTION:download":function(){return"Download configuration"},"PAGE_ACTION:download:workflow":function(){return"Programmer configuration"},"PAGE_ACTION:download:feature":function(){return"Driver configuration"},"PROPERTY:srcId":function(){return"Installation ID"},"PROPERTY:srcTitle":function(){return"Installation title"},"PROPERTY:srcIp":function(){return"Installation IP"},"PROPERTY:srcUuid":function(){return"Installation key"},"PROPERTY:no":function(){return"Order no"},"PROPERTY:totalCounter":function(){return"Total programming attemps"},"PROPERTY:successCounter":function(){return"Successful programming attempts"},"PROPERTY:failureCounter":function(){return"Failed programming attempts"},"PROPERTY:order":function(){return"Order"},"PROPERTY:quantity":function(){return"Quantity"},"PROPERTY:counter":function(){return"Counter"},"PROPERTY:nc12":function(){return"12NC"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:log":function(){return"Log"},"PROPERTY:result":function(){return"Result"},"PROPERTY:errorCode":function(){return"Error"},"PROPERTY:exception":function(){return"Exception"},"PROPERTY:output":function(){return"Programmer output"},"PROPERTY:featureFile":function(){return"Driver configuration file"},"PROPERTY:featureFileName":function(){return"Driver configuration file name"},"PROPERTY:feature":function(){return"Driver configuration file contents"},"PROPERTY:workflowFile":function(){return"Programmer configuration file"},"PROPERTY:workflow":function(){return"Programmer configuration file contents"},"PROPERTY:programName":function(){return"Program name"},"filter:result:success":function(){return"Success"},"filter:result:failure":function(){return"Failure"},"filter:placeholder:srcId":function(){return"Any"},"filter:submit":function(){return"Filter results"},"step:pe":function(){return"Protective earth test"},"step:sol":function(){return"Fortimo Solar programming"},"step:fn":function(){return"Functional test"},"tab:log":function(){return"Programming log"},"tab:output":function(){return"Communication log"},"tab:workflow":function(){return"Programmer configuration"},"tab:feature":function(){return"Driver configuration"},"tab:program":function(){return"Program"},"metrics:title":function(){return"Measured values"},"metrics:u":function(){return"Voltage"},"metrics:uSet":function(){return"Set voltage"},"metrics:uGet":function(){return"Measured voltage"},"metrics:i":function(){return"Current"},"metrics:r":function(){return"Resistance"},"metrics:p":function(){return"Power"},"log:ORDER_CREATED":function(r){return"Starting a new order no <code>"+e.v(r,"orderNo")+"</code> (1/"+e.v(r,"quantity")+")..."},"log:ORDER_CONTINUED":function(r){return"Continuing an existing order no <code>"+e.v(r,"orderNo")+"</code> ("+e.v(r,"counter")+"/"+e.v(r,"quantity")+")..."},"log:PROGRAMMING_STARTED":function(r){return"Starting a programming of the 12NC <code>"+e.v(r,"nc12")+"</code>..."},"log:COUNTDOWN_STARTED":function(r){return"Counting down <code>"+e.v(r,"delay")+"</code> "+e.p(r,"delay",0,"en",{one:"second",other:"seconds"})+"..."},"log:READING_WORKFLOW_FILE":function(r){return"Reading contents of the programmer configuration file: <code>"+e.v(r,"workflowFile")+"</code>"},"log:WORKFLOW_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the programmer configuration file."},"log:WRITING_WORKFLOW_FILE":function(r){return"Writing contents of the programmer configuratino file: <code>"+e.v(r,"workflowFile")+"</code> (<code>"+e.v(r,"workflowOptions")+"</code>)"},"log:WORKFLOW_FILE_WRITTEN":function(r){return"Written <code>"+e.v(r,"length")+"B</code> of the programmer configuration file."},"log:SEARCHING_FEATURE_FILE":function(r){return"Searching for a driver configuration file in path: <code>"+e.v(r,"featurePath")+"</code>"},"log:SEARCHING_FEATURE_FILE_FAILURE":function(r){return"Driver configuration file searching failed: <code>"+e.v(r,"error")+"</code>"},"log:SEARCHING_FEATURE_FILE_TIMEOUT":function(){return"Driver configuration file searching timed out."},"log:MISSING_FEATURE_FILE_1":function(){return"Driver configuration file was not found in the first path."},"log:MISSING_FEATURE_FILE_2":function(){return"Driver configuration file was not found in the backup path."},"log:DUPLICATE_FEATURE_FILE_1":function(r){return"Found "+e.v(r,"fileCount")+" driver configuration "+e.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the first path."},"log:DUPLICATE_FEATURE_FILE_2":function(r){return"Found "+e.v(r,"fileCount")+" driver configuration "+e.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the backup path."},"log:FEATURE_FILE_FOUND":function(r){return"Found the driver configuration file: <code>"+e.v(r,"featureFile")+"</code>"},"log:SKIPPING_FEATURE_FILE_2":function(){return"Skipping searching for the driver configuration file in the backup path..."},"log:CANCELLING":function(){return"Cancelling the programming..."},"log:PROGRAMMING_SUCCESS":function(r){return"Successfully finished the programming of the 12NC <code>"+e.v(r,"nc12")+"</code> in <code>"+e.v(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Finished the programming of the 12NC <code>"+e.v(r,"nc12")+"</code> in <code>"+e.v(r,"duration")+"</code> with an error: <code>"+e.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE":function(){return"Reading contents of the driver configuration file..."},"log:READING_FEATURE_FILE_FAILURE":function(r){return"Reading contents of the driver configuration file failed: <code>"+e.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading contents of the driver configuration file timed out."},"log:FEATURE_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the driver configuration file."},"log:STARTING_PROGRAMMER":function(r){return"Starting the programmer using the <code>"+e.s(r,"interface",{d:"USB2DALI",s:"SimpleSet®",z:"ZigBee",i:"IP",other:e.v(r,"interface")})+"</code> interface: <code>"+e.v(r,"programmerFile")+"</code>"},"log:SOL_STARTED":function(){return"Starting a Fortimo Solar programming..."},"log:SOL_PARSE_ERROR":function(r){return"Error during a parsing of the program file in line <code>"+e.v(r,"i")+"</code>: <code>"+e.v(r,"line")+"</code>"},"log:SOL_SEARCHING_COM":function(r){return"Searching for a serial port using matching the pattern: <code>"+e.v(r,"pattern")+"</code>..."},"log:SOL_OPENING_COM":function(r){return"Opening the <code>"+e.v(r,"comPort")+"</code> serial port..."},"log:SOL_EXECUTING_SET_COMMANDS":function(r){return"Executing "+e.p(r,"count",0,"en",{one:"<code>1</code> SET parameter value command",other:"<code>"+e.v(r,"count")+"</code> SET parameter value commands"})+"..."},"log:SOL_RESETTING":function(){return"Resetting the device..."},"log:SOL_EXECUTING_GET_COMMANDS":function(){return"Comparing the programmed parameter values..."},"log:SOL_INVALID_OPTION":function(r){return"Read parameter value of option <code>"+e.v(r,"option")+"</code> differs from the programmed value (expected <code>"+e.v(r,"expected")+"</code>; got <code>"+e.v(r,"actual")+"</code>)."},"log:LPT_STARTING":function(){return"(LPT) Waiting for a signal to start the programmer..."},"log:LPT_FINISHING":function(){return"(LPT) Setting the result value..."},"log:TESTING_STARTED":function(r){return"Starting <code>"+e.v(r,"program")+"</code> program..."},"log:TESTING_SEARCHING_COM":function(r){return"Searching for a serial port using matching the pattern: <code>"+e.v(r,"pattern")+"</code>..."},"log:TESTING_OPENING_COM":function(r){return"Opening the <code>"+e.v(r,"comPort")+"</code> serial port..."},"log:TESTING_SDP_SETUP":function(){return"Setting up the SDP..."},"log:TESTING_SDP_TEARDOWN":function(){return"Tearing down the SDP..."},"log:TESTING_PLC_SETUP":function(){return"Setting up the PLC..."},"log:TESTING_PLC_TEARDOWN":function(){return"Tearing down the PLC..."},"log:TESTING_EXECUTING_STEP":function(r){return e.s(r,"type",{pe:"Executing the protective earth test",sol:"Executing the Fortimo Solar programming",fn:"Executing the functional test",other:"Executing the <em>"+e.v(r,"type")+"</em> program step"})+"..."},"error:WORKFLOW_FILE_ERROR":function(){return"Error during the reading of the programmer configuration file contents."},"error:WORKFLOW_FILE_WRITE_ERROR":function(){return"Error during the writing of the programmer configuration file contents."},"error:FEATURE_FILE_ERROR":function(){return"Error during the reading of the driver configuration file contents."},"error:UNSET_WORKFLOW_FILE":function(){return"Path to the programmer configuration file was not set."},"error:UNSET_FEATURE_PATH_1":function(){return"First path to the driver configuration files was not set."},"error:UNSET_PROGRAMMER_FILE":function(){return"Path to the programmer executable file was not set."},"error:MISSING_WORKFLOW_FILE":function(){return"Programmer configuration file was not found."},"error:MISSING_FEATURE_FILE":function(){return"Driver configuration file was not found."},"error:DUPLICATE_FEATURE_FILE":function(){return"Detected multiple driver configuration files for the specified 12NC."},"error:CANCELLED":function(){return"Programming cancelled."},"error:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading of the contents of the driver configuration file timed out."},"error:MISSING_PROGRAMMER_FILE":function(){return"Programmer executable file was not found."},"error:PROGRAMMER_FILE_ERROR":function(){return"Error during running of the programmer executable file."},"error:EXIT_CODE:-1":function(){return"MultiOneWorkflow (-1): general application failure."},"error:EXIT_CODE:1":function(){return"MultiOneWorkflow (1): user software key not activated."},"error:EXIT_CODE:4":function(){return"MultiOneWorkflow (4): verification failed."},"error:EXIT_CODE:5":function(){return"MultiOneWorkflow (5): The interface provided as argument to the command line is wrong."},"error:EXIT_CODE:9":function(){return"MultiOneWorkflow (9): workflow configuration file not found."},"error:EXIT_CODE:10":function(){return"MultiOneWorkflow (10): workflow configuration file not valid."},"error:EXIT_CODE:20":function(){return"MultiOneWorkflow (20): supported devices file not found."},"error:EXIT_CODE:21":function(){return"MultiOneWorkflow (21): supported devices file not valid."},"error:EXIT_CODE:101":function(){return"MultiOneWorkflow (101): there are no features to write."},"error:EXIT_CODE:102":function(){return"MultiOneWorkflow (102): writing failed."},"error:EXIT_CODE:150":function(){return"MultiOneWorkflow (150): resetting the short address of the device failed."},"error:EXIT_CODE:200":function(){return"MultiOneWorkflow (200): feature file not present."},"error:EXIT_CODE:201":function(){return"MultiOneWorkflow (201): invalid feature configuration file."},"error:EXIT_CODE:202":function(){return"MultiOneWorkflow (202): feature configuration file is null or empty."},"error:EXIT_CODE:203":function(){return"MultiOneWorkflow (203): feature configuration file contains duplicate features."},"error:EXIT_CODE:300":function(){return"MultiOneWorkflow (300): the device does not support all features from the feature configuration file."},"error:EXIT_CODE:301":function(){return"MultiOneWorkflow (301): the device is not of the model specified in the feature file."},"error:EXIT_CODE:400":function(){return"MultiOneWorkflow (400): writing traceability information failed."},"error:EXIT_CODE:500":function(){return"MultiOneWorkflow (500): no device found."},"error:EXIT_CODE:501":function(){return"MultiOneWorkflow (501): too many devices found."},"error:EXIT_CODE:502":function(){return"MultiOneWorkflow (502): unable to execute discover."},"error:EXIT_CODE:503":function(){return"MultiOneWorkflow (503): multiple devices share the same short address."},"error:EXIT_CODE:504":function(){return"MultiOneWorkflow (504): unsupported device detected."},"error:EXIT_CODE:600":function(){return"MultiOneWorkflow (600): no features to convert."},"error:EXIT_CODE:700":function(){return"MultiOneWorkflow (700): no interface connected."},"error:EXIT_CODE:800":function(){return"MultiOneWorkflow (800): convert feature data is not possible."},"error:EXIT_CODE:900":function(){return"MultiOneWorkflow (900): the provided scheduler file is invalid and could not be loaded."},"error:SOL_PARSE_ERROR":function(){return"SOL: Error during parsing of the program file."},"error:SOL_NO_COMMANDS":function(){return"SOL: No SET commands were found in the program file."},"error:SOL_SEARCHING_COM_FAILURE":function(){return"SOL: Error while searching for a serial port."},"error:SOL_COM_NOT_FOUND":function(){return"SOL: Serial port was not found."},"error:SOL_OPENING_COM_FAILURE":function(){return"SOL: Error while opening the serial port."},"error:SOL_SERIAL_PORT_FAILURE":function(){return"SOL: Serial port error."},"error:SOL_NO_CONNECTION":function(){return"SOL: No response from the device. Check the serial port connection."},"error:SOL_INVALID_OPTION":function(){return"SOL: Read value differs from the programmed one."},"error:LPT_FILE_ERROR":function(){return"Error during LPT communication."},"error:LPT_START_TIMEOUT":function(){return"Waiting for a signal to start the programmer timed out."},"error:T24VDC_FEATURE_DISABLED":function(){return"The current license doesn't have the Tester 24V DC option."},"error:TESTING_DISABLED":function(){return"TEST: Testing option is disabled."},"error:TESTING_NOT_SOL":function(){return"TEST: The found driver configuration has an invalid type."},"error:TESTING_SEARCHING_COM_FAILURE":function(){return"TEST: Error while searching for a serial port."},"error:TESTING_COM_NOT_FOUND":function(){return"TEST: Serial port was not found."},"error:TESTING_OPENING_COM_FAILURE":function(){return"TEST: Error while opening the serial port."},"error:TESTING_SERIAL_PORT_FAILURE":function(){return"TEST: Serial port error."},"error:TESTING_PLC_FAILURE":function(){return"TEST: PLC error."},"error:TESTING_PLC_NO_CONNECTION":function(){return"TEST: Failed to connect to the PLC. Check the Modbus settings."},"error:TESTING_SDP_TIMEOUT":function(){return"TEST: Waiting for a response from the SDP timed out."},"error:TESTING_SDP_INVALID_RESPONSE":function(){return"TEST: Received an invalid response from the SDP."},"error:TESTING_MAX_RESISTANCE":function(){return"TEST: Exceeded the maximum resistance value."},"error:TESTING_MIN_POWER":function(){return"TEST: Exceeded the minimum power value."},"error:TESTING_MAX_POWER":function(){return"TEST: Exceeded the maximum power value."}},pl:!0}});