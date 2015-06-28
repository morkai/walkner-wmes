define(["app/nls/locale/en"],function(r){var e={lc:{pl:function(e){return r(e)},en:function(e){return r(e)}},c:function(r,e){if(!r)throw new Error("MessageFormat: Data required for '"+e+"'.")},n:function(r,e,n){if(isNaN(r[e]))throw new Error("MessageFormat: '"+e+"' isn't a number.");return r[e]-(n||0)},v:function(r,n){return e.c(r,n),r[n]},p:function(r,n,t,o,i){return e.c(r,n),r[n]in i?i[r[n]]:(n=e.lc[o](r[n]-t),n in i?i[n]:i.other)},s:function(r,n,t){return e.c(r,n),r[n]in t?t[r[n]]:t.other}};return{root:{"BREADCRUMBS:base":function(){return"Xiconf"},"BREADCRUMBS:browse":function(){return"Results"},"BREADCRUMBS:details":function(){return"Result"},"BREADCRUMBS:settings":function(){return"Settings"},"MSG:LOADING_FAILURE":function(){return"Failed to load the programming results :("},"MSG:LOADING_SINGLE_FAILURE":function(){return"Failed to load the programming result :("},"PANEL:TITLE:details:order":function(){return"Local order details"},"PANEL:TITLE:details:entry":function(){return"Programming details"},"PAGE_ACTION:export":function(){return"Export results"},"PAGE_ACTION:download":function(){return"Download configuration"},"PAGE_ACTION:download:workflow":function(){return"MultiOneWorkflow config"},"PAGE_ACTION:download:feature":function(){return"Driver config"},"PAGE_ACTION:download:gprsOrderFile":function(){return"Order"},"PAGE_ACTION:download:gprsInputFile":function(){return"CityTouchIPT config"},"PAGE_ACTION:download:gprsOutputFile":function(){return"CityTouchIPT result"},"PROPERTY:srcId":function(){return"Installation ID"},"PROPERTY:srcTitle":function(){return"Installation title"},"PROPERTY:srcIp":function(){return"Installation IP"},"PROPERTY:srcUuid":function(){return"Installation key"},"PROPERTY:no":function(){return"Order no"},"PROPERTY:totalCounter":function(){return"Total programming attemps"},"PROPERTY:successCounter":function(){return"Successful programming attempts"},"PROPERTY:failureCounter":function(){return"Failed programming attempts"},"PROPERTY:order":function(){return"Order"},"PROPERTY:quantity":function(){return"Quantity"},"PROPERTY:counter":function(){return"Counter"},"PROPERTY:nc12":function(){return"Program 12NC"},"PROPERTY:gprsNc12":function(){return"GPRS 12NC"},"PROPERTY:startedAt":function(){return"Started at"},"PROPERTY:finishedAt":function(){return"Finished at"},"PROPERTY:duration":function(){return"Duration"},"PROPERTY:log":function(){return"Log"},"PROPERTY:result":function(){return"Result"},"PROPERTY:errorCode":function(){return"Error"},"PROPERTY:exception":function(){return"Exception"},"PROPERTY:output":function(){return"Programmer output"},"PROPERTY:featureFile":function(){return"Driver configuration file"},"PROPERTY:featureFileName":function(){return"Driver configuration file name"},"PROPERTY:feature":function(){return"Driver configuration file contents"},"PROPERTY:workflowFile":function(){return"Programmer configuration file"},"PROPERTY:workflow":function(){return"Programmer configuration file contents"},"PROPERTY:programName":function(){return"Program name"},"PROPERTY:serviceTag":function(){return"Service Tag"},"PROPERTY:prodLine":function(){return"Production line"},"details:showOrderSummaryLink":function(){return"Show the order summary"},"filter:result:success":function(){return"Success"},"filter:result:failure":function(){return"Failure"},"filter:placeholder:srcId":function(){return"Any"},"filter:nc12Type:program":function(){return"Program 12NC"},"filter:nc12Type:led":function(){return"LED board 12NC"},"filter:submit":function(){return"Filter results"},"step:wait":function(){return"Wait"},"step:pe":function(){return"Protective earth test"},"step:sol":function(){return"Fortimo Solar programming"},"step:fn":function(){return"Functional test"},"tab:log":function(){return"Programming log"},"tab:output":function(){return"Communication log"},"tab:workflow":function(){return"Programmer config"},"tab:feature":function(){return"Driver config"},"tab:leds":function(){return"LED boards"},"tab:program":function(){return"Program"},"tab:gprsOrderFile":function(){return"Order"},"tab:gprsInputFile":function(){return"CityTouchIPT config"},"tab:gprsOutputFile":function(){return"CityTouchIPT result"},"metrics:title":function(){return"Measured values"},"metrics:u":function(){return"Voltage"},"metrics:uSet":function(){return"Set voltage"},"metrics:uGet":function(){return"Measured voltage"},"metrics:i":function(){return"Current"},"metrics:r":function(){return"Resistance"},"metrics:p":function(){return"Power"},"leds:error:INVALID_NC12":function(r){return"Invalid 12NC:<br>"+e.v(r,"nc12")+"!"},"leds:error:NO_CONNECTION":function(){return"No connection to<br>the remote server!"},"leds:error:TIMEOUT":function(){return"Response timeout!"},"ledS:error:DB_FAILURE":function(){return"Database failure!"},"leds:error:UNKNOWN_ORDER_NO":function(){return"Unknown order!"},"leds:error:UNKNOWN_ITEM_NC12":function(){return"Unknown order item!"},"leds:error:SERIAL_NUMBER_USED":function(r){return"SN already used in order "+e.v(r,"orderNo")+":<br>"+e.v(r,"name")},"log:ORDER_CREATED":function(r){return"Starting a new order no <code>"+e.v(r,"orderNo")+"</code> (1/"+e.v(r,"quantity")+")..."},"log:ORDER_CONTINUED":function(r){return"Continuing an existing order no <code>"+e.v(r,"orderNo")+"</code> ("+e.v(r,"counter")+"/"+e.v(r,"quantity")+")..."},"log:PROGRAMMING_STARTED":function(r){return"Starting a programming of the 12NC <code>"+e.v(r,"nc12")+"</code>..."},"log:COUNTDOWN_STARTED":function(r){return"Counting down <code>"+e.v(r,"delay")+"</code> "+e.p(r,"delay",0,"en",{one:"second",other:"seconds"})+"..."},"log:READING_WORKFLOW_FILE":function(r){return"Reading contents of the programmer configuration file: <code>"+e.v(r,"workflowFile")+"</code>"},"log:WORKFLOW_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the programmer configuration file."},"log:WRITING_WORKFLOW_FILE":function(r){return"Writing contents of the programmer configuratino file: <code>"+e.v(r,"workflowFile")+"</code> (<code>"+e.v(r,"workflowOptions")+"</code>)"},"log:WORKFLOW_FILE_WRITTEN":function(r){return"Written <code>"+e.v(r,"length")+"B</code> of the programmer configuration file."},"log:USING_LAST_FEATURE_FILE":function(){return"Skipping searching for a driver configuration file: the last file will be used."},"log:SEARCHING_FEATURE_FILE":function(r){return"Searching for a driver configuration file in path: <code>"+e.v(r,"featurePath")+"</code>"},"log:SEARCHING_FEATURE_FILE_FAILURE":function(r){return"Driver configuration file searching failed: <code>"+e.v(r,"error")+"</code>"},"log:SEARCHING_FEATURE_FILE_TIMEOUT":function(){return"Driver configuration file searching timed out."},"log:MISSING_FEATURE_FILE_1":function(){return"Driver configuration file was not found in the first path."},"log:MISSING_FEATURE_FILE_2":function(){return"Driver configuration file was not found in the backup path."},"log:DUPLICATE_FEATURE_FILE_1":function(r){return"Found "+e.v(r,"fileCount")+" driver configuration "+e.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the first path."},"log:DUPLICATE_FEATURE_FILE_2":function(r){return"Found "+e.v(r,"fileCount")+" driver configuration "+e.p(r,"fileCount",0,"en",{one:"file",other:"files"})+" for the specified 12NC in the backup path."},"log:FEATURE_FILE_FOUND":function(r){return"Found the driver configuration file: <code>"+e.v(r,"featureFile")+"</code>"},"log:SKIPPING_FEATURE_FILE_2":function(){return"Skipping searching for the driver configuration file in the backup path..."},"log:CANCELLING":function(){return"Cancelling the programming..."},"log:PROGRAMMING_SUCCESS":function(r){return"Successfully finished the programming of the 12NC <code>"+e.v(r,"nc12")+"</code> in <code>"+e.v(r,"duration")+"</code>."},"log:PROGRAMMING_FAILURE":function(r){return"Unsuccessfully finished the programming of the 12NC <code>"+e.v(r,"nc12")+"</code> in <code>"+e.v(r,"duration")+"</code> with an error: <code>"+e.v(r,"error")+"</code>"},"log:LED_SCANNING_SUCCESS":function(r){return"Successfully finished the LED boards scanning in <code>"+e.v(r,"duration")+"</code>."},"log:LED_SCANNING_FAILURE":function(r){return"Unsuccessfully finished the LED boards scanning in <code>"+e.v(r,"duration")+"</code> with an error: <code>"+e.v(r,"error")+"</code>"},"log:TESTING_SUCCESS":function(r){return"Successfully finished the testing in <code>"+e.v(r,"duration")+"</code>."},"log:TESTING_FAILURE":function(r){return"Unsuccessfully finished the testing in <code>"+e.v(r,"duration")+"</code> with an error: <code>"+e.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE":function(){return"Reading contents of the driver configuration file..."},"log:READING_FEATURE_FILE_FAILURE":function(r){return"Reading contents of the driver configuration file failed: <code>"+e.v(r,"error")+"</code>"},"log:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading contents of the driver configuration file timed out."},"log:FEATURE_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the driver configuration file."},"log:STARTING_PROGRAMMER":function(r){return"Starting the programmer using the <code>"+e.s(r,"interface",{d:"USB2DALI",s:"SimpleSet®",z:"ZigBee",i:"IP",other:"?"})+"</code> interface: <code>"+e.v(r,"programmerFile")+"</code>"},"log:SOL_STARTED":function(){return"Starting a Fortimo Solar programming..."},"log:SOL_PARSE_ERROR":function(r){return"Error during a parsing of the program file in line <code>"+e.v(r,"i")+"</code>: <code>"+e.v(r,"line")+"</code>"},"log:SOL_SEARCHING_COM":function(r){return"Searching for a serial port using matching the pattern: <code>"+e.v(r,"pattern")+"</code>..."},"log:SOL_OPENING_COM":function(r){return"Opening the <code>"+e.v(r,"comPort")+"</code> serial port..."},"log:SOL_EXECUTING_SET_COMMANDS":function(r){return"Executing "+e.p(r,"count",0,"en",{one:"<code>1</code> SET parameter value command",other:"<code>"+e.v(r,"count")+"</code> SET parameter value commands"})+"..."},"log:SOL_RESETTING":function(){return"Resetting the device..."},"log:SOL_EXECUTING_GET_COMMANDS":function(){return"Comparing the programmed parameter values..."},"log:SOL_INVALID_OPTION":function(r){return"Read parameter value of option <code>"+e.v(r,"option")+"</code> differs from the programmed value (expected <code>"+e.v(r,"expected")+"</code>; got <code>"+e.v(r,"actual")+"</code>)."},"log:LPT_STARTING":function(){return"(LPT) Waiting for a signal to start the programmer..."},"log:LPT_FINISHING":function(){return"(LPT) Setting the result value..."},"log:TESTING_WITH_PROGRAM_STARTED":function(){return"Starting the testing process..."},"log:TESTING_STARTED":function(r){return"Starting <code>"+e.v(r,"program")+"</code> program..."},"log:TESTING_SEARCHING_COM":function(r){return"Searching for a serial port using matching the pattern: <code>"+e.v(r,"pattern")+"</code>..."},"log:TESTING_OPENING_COM":function(r){return"Opening the <code>"+e.v(r,"comPort")+"</code> serial port..."},"log:TESTING_SDP_SETUP":function(){return"Setting up the SDP..."},"log:TESTING_SDP_TEARDOWN":function(){return"Tearing down the SDP..."},"log:TESTING_PLC_SETUP":function(){return"Setting up the PLC..."},"log:TESTING_PLC_TEARDOWN":function(){return"Tearing down the PLC..."},"log:TESTING_EXECUTING_STEP":function(r){return e.s(r,"type",{wait:"Waiting",pe:"Executing the protective earth test",iso:"Executing the isolation resistance test",sol:"Executing the Fortimo Solar programming",program:"Executing the programming step",fn:"Executing the functional test",vis:"Executing the visual test",other:"Executing the <em>"+e.v(r,"type")+"</em> program step"})+"..."},"log:TESTING_SKIPPING_PROGRAMMING":function(){return"Skipping the programming step..."},"log:ACQUIRING_SERVICE_TAG":function(){return"Acquiring a new Service Tag..."},"log:SERVICE_TAG_ACQUIRED":function(r){return"Acquired Service Tag: <code>"+e.v(r,"serviceTag")+"</code>"},"log:ACQUIRING_SERVICE_TAG_FAILURE":function(r){return"Failed to acquire a new Service Tag: <code>"+e.v(r,"error")+"</code>"},"log:SKIPPING_SERVICE_TAG_ACQUIRING":function(){return"Skipping acquiring a new Service Tag..."},"log:PRINTING_SERVICE_TAG":function(r){return"Printing a Service Tag label on the <code>"+e.v(r,"printerName")+"</code> printer..."},"log:PRINTING_SERVICE_TAG_FAILURE":function(r){return"Failed to print a Service Tag label: <code>"+e.v(r,"error")+"</code>"},"log:LED_CHECKING_STARTED":function(){return"Starting the LED boards check..."},"log:WAITING_FOR_LEDS":function(r){return"Waiting for "+e.v(r,"ledCount")+" LED "+e.p(r,"ledCount",0,"en",{one:"board",other:"boards"})+"..."},"log:ADDING_LAST_LEDS":function(r){return"Adding "+e.v(r,"ledCount")+" LED "+e.p(r,"ledCount",0,"en",{one:"board",other:"boards"})+" from the last failed programming..."},"log:WAITING_FOR_CONTINUE":function(){return"Waiting for the Continue button to be pressed..."},"log:GENERATING_SERVICE_TAG":function(){return"Generating a new Service Tag..."},"log:SERVICE_TAG_GENERATED":function(r){return"Generated Service Tag: <code>"+e.v(r,"serviceTag")+"</code>"},"error:WORKFLOW_FILE_ERROR":function(){return"Error during the reading of the programmer configuration file contents."},"error:WORKFLOW_FILE_WRITE_ERROR":function(){return"Error during the writing of the programmer configuration file contents."},"error:FEATURE_FILE_ERROR":function(){return"Error during the reading of the driver configuration file contents."},"error:UNSET_WORKFLOW_FILE":function(){return"Path to the programmer configuration file was not set."},"error:UNSET_FEATURE_PATH_1":function(){return"First path to the driver configuration files was not set."},"error:UNSET_PROGRAMMER_FILE":function(){return"Path to the programmer executable file was not set."},"error:MISSING_WORKFLOW_FILE":function(){return"Programmer configuration file was not found."},"error:MISSING_FEATURE_FILE":function(){return"Driver configuration file was not found."},"error:DUPLICATE_FEATURE_FILE":function(){return"Detected multiple driver configuration files for the specified 12NC."},"error:CANCELLED":function(){return"Programming cancelled."},"error:READING_FEATURE_FILE_TIMEOUT":function(){return"Reading the contents of the driver configuration file timed out."},"error:MISSING_PROGRAMMER_FILE":function(){return"Programmer executable file was not found."},"error:PROGRAMMER_FILE_ERROR":function(){return"Error during running of the programmer executable file."},"error:EXIT_CODE:-1":function(){return"MultiOneWorkflow (-1): general application failure."},"error:EXIT_CODE:1":function(){return"MultiOneWorkflow (1): user software key not activated."},"error:EXIT_CODE:4":function(){return"MultiOneWorkflow (4): verification failed."},"error:EXIT_CODE:5":function(){return"MultiOneWorkflow (5): The interface provided as argument to the command line is wrong."},"error:EXIT_CODE:9":function(){return"MultiOneWorkflow (9): workflow configuration file not found."},"error:EXIT_CODE:10":function(){return"MultiOneWorkflow (10): workflow configuration file not valid."},"error:EXIT_CODE:20":function(){return"MultiOneWorkflow (20): supported devices file not found."},"error:EXIT_CODE:21":function(){return"MultiOneWorkflow (21): supported devices file not valid."},"error:EXIT_CODE:101":function(){return"MultiOneWorkflow (101): there are no features to write."},"error:EXIT_CODE:102":function(){return"MultiOneWorkflow (102): writing failed."},"error:EXIT_CODE:150":function(){return"MultiOneWorkflow (150): resetting the short address of the device failed."},"error:EXIT_CODE:200":function(){return"MultiOneWorkflow (200): feature file not present."},"error:EXIT_CODE:201":function(){return"MultiOneWorkflow (201): invalid feature configuration file."},"error:EXIT_CODE:202":function(){return"MultiOneWorkflow (202): feature configuration file is null or empty."},"error:EXIT_CODE:203":function(){return"MultiOneWorkflow (203): feature configuration file contains duplicate features."},"error:EXIT_CODE:300":function(){return"MultiOneWorkflow (300): the device does not support all features from the feature configuration file."},"error:EXIT_CODE:301":function(){return"MultiOneWorkflow (301): the device is not of the model specified in the feature file."},"error:EXIT_CODE:400":function(){return"MultiOneWorkflow (400): writing traceability information failed."},"error:EXIT_CODE:500":function(){return"MultiOneWorkflow (500): no device found."},"error:EXIT_CODE:501":function(){return"MultiOneWorkflow (501): too many devices found."},"error:EXIT_CODE:502":function(){return"MultiOneWorkflow (502): unable to execute discover."},"error:EXIT_CODE:503":function(){return"MultiOneWorkflow (503): multiple devices share the same short address."},"error:EXIT_CODE:504":function(){return"MultiOneWorkflow (504): unsupported device detected."},"error:EXIT_CODE:600":function(){return"MultiOneWorkflow (600): no features to convert."},"error:EXIT_CODE:700":function(){return"MultiOneWorkflow (700): no interface connected."},"error:EXIT_CODE:800":function(){return"MultiOneWorkflow (800): convert feature data is not possible."},"error:EXIT_CODE:900":function(){return"MultiOneWorkflow (900): the provided scheduler file is invalid and could not be loaded."},"error:SOL_PARSE_ERROR":function(){return"SOL: Error during parsing of the program file."},"error:SOL_NO_COMMANDS":function(){return"SOL: No SET commands were found in the program file."},"error:SOL_SEARCHING_COM_FAILURE":function(){return"SOL: Error while searching for a serial port."},"error:SOL_COM_NOT_FOUND":function(){return"SOL: Serial port was not found."},"error:SOL_OPENING_COM_FAILURE":function(){return"SOL: Error while opening the serial port."},"error:SOL_SERIAL_PORT_FAILURE":function(){return"SOL: Serial port error."},"error:SOL_INVALID_OPTION":function(){return"SOL: Read value differs from the programmed one."},"error:SOL_NO_CONNECTION":function(){return"SOL: No response from the device. Check the serial port connection."},"error:SOL_FEATURE_DISABLED":function(){return"The current license doesn't have the Fortimo Solar programming option."},"error:LPT_FILE_ERROR":function(){return"Error during LPT communication."},"error:LPT_START_TIMEOUT":function(){return"Waiting for a signal to start the programmer timed out."},"error:T24VDC_FEATURE_DISABLED":function(){return"The current license doesn't have the Tester 24V DC option."},"error:TESTING_DISABLED":function(){return"T24VDC: Testing option is disabled."},"error:TESTING_NOT_SOL":function(){return"T24VDC: The found driver configuration has an invalid type."},"error:TESTING_SEARCHING_COM_FAILURE":function(){return"T24VDC: Error while searching for a serial port."},"error:TESTING_COM_NOT_FOUND":function(){return"T24VDC: Serial port was not found."},"error:TESTING_OPENING_COM_FAILURE":function(){return"T24VDC: Error while opening the serial port."},"error:TESTING_SERIAL_PORT_FAILURE":function(){return"T24VDC: Serial port error."},"error:TESTING_PLC_FAILURE":function(){return"T24VDC: PLC error."},"error:TESTING_PLC_NO_CONNECTION":function(){return"T24VDC: Failed to connect to the PLC. Check the Modbus settings."},"error:TESTING_SDP_TIMEOUT":function(){return"T24VDC: Waiting for a response from the SDP timed out."},"error:TESTING_SDP_INVALID_RESPONSE":function(){return"T24VDC: Received an invalid response from the SDP."},"error:TESTING_MAX_RESISTANCE":function(){return"T24VDC: Exceeded the maximum resistance value."},"error:TESTING_MIN_POWER":function(){return"T24VDC: Exceeded the minimum power value."},"error:TESTING_MAX_POWER":function(){return"T24VDC: Exceeded the maximum power value."},"error:REMOTE_SERVICE_TAG_FAILURE":function(){return"Error during acquisition of a new Service Tag."},"error:INVALID_ITEM_QUANTITY":function(){return"Detected invalid component quantities in the current order."},"log:GPRS:READING_ORDER_FILE":function(r){return"Reading contents of the order file: <code>"+e.v(r,"orderFile")+"</code>"},"log:GPRS:ORDER_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the order file."},"log:GPRS:READING_INPUT_TEMPLATE_FILE":function(r){return"Reading the programmer input template file: <code>"+e.v(r,"inputTemplateFile")+"</code>"},"log:GPRS:INPUT_TEMPLATE_FILE_READ":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the programmer input template file."},"log:GPRS:PARSING_INPUT_TEMPLATE":function(){return"Parsing the programmer input template file..."},"log:GPRS:PARSING_INPUT_TEMPLATE_SUCCESS":function(){return"Successfully parsed the programmer input template file."},"log:GPRS:PREPARING_INPUT_FILE":function(){return"Preparing the programmer input file..."},"log:GPRS:PREPARING_INPUT_FILE_SUCCESS":function(){return"Successfully prepared the programmer input file."},"log:GPRS:PROGRAMMER_FILE_STARTED":function(r){return"Starting the programmer using the <code>"+e.v(r,"daliPort")+"</code> DALI port: <code>"+e.v(r,"programmerFile")+"</code>"},"log:GPRS:READING_OUTPUT_FILE":function(r){return"Reading the programmer output file: <code>"+e.v(r,"outputFile")+"</code>"},"log:GPRS:READING_OUTPUT_FILE_SUCCESS":function(r){return"Read <code>"+e.v(r,"length")+"B</code> of the programmer input template file."},"log:GPRS:COPYING_OUTPUT_FILE":function(){return"Copying the programmer output file.."},"log:GPRS:COPYING_OUTPUT_FILE_SUCCESS":function(){return"Successfully copied the programmer output file."},"log:GPRS:VERIFICATION_STARTED":function(){return"Starting the verification process..."},"log:GPRS:VERIFICATION_SKIPPED":function(){return"Skipping the verification process..."},"error:GPRS:READING_ORDER_FILE_FAILURE":function(){return"GPRS: Reading contents of the order file failed."},"error:GPRS:READING_ORDER_FILE_TIMEOUT":function(){return"GPRS: Reading the contents of the order file timed out."},"error:GPRS:READING_INPUT_TEMPLATE_FILE_FAILURE":function(){return"GPRS: Reading contents of the programmer input template file failed."},"error:GPRS:READING_INPUT_TEMPLATE_FILE_TIMEOUT":function(){return"GPRS: Reading the contents of the programmer input template file timed out."},"error:GPRS:PARSING_INPUT_TEMPLATE_FAILURE":function(){return"GPRS: Error during parsing of the programmer input template file."},"error:GPRS:PREPARING_INPUT_FILE_FAILURE":function(){return"GPRS: Error during saving of the programmer input configuration file."},"error:GPRS:INVALID_OPTION":function(){return"GPRS: Invalid configuration option."},"error:GPRS:PARSING_DRIVER_FILE_FAILURE":function(){return"GPRS: Error during parsing of the driver configuration file."},"error:GPRS:PROGRAMMER_FILE_UNSET":function(){return"GPRS: Path to the programmer executable file was not set."},"error:GPRS:PROGRAMMER_FILE_MISSING":function(){return"GPRS: Programmer executable file was not found."},"error:GPRS:PROGRAMMER_FILE_FAILURE":function(){return"GPRS: Error during execution of the programmer executable."},"error:GPRS:OUTPUT_FILE_MISSING":function(){return"GPRS: Programmer output file was not found."},"error:GPRS:COPYING_OUTPUT_FILE_FAILURE":function(){return"GPRS: Error during copying of the programmer output file."},"error:GPRS:VERIFICATION_INPUT_FAILURE":function(){return"GPRS: Error during copying of the programmer output file for verification."},"error:GPRS:VERIFICATION_ERROR":function(){return"GPRS: Programmer output file didn't pass the verification."},"error:GPRS:VERIFICATION_TIMEOUT":function(){return"GPRS: Programmer output file verification timed out."},"error:GPRS:EXIT_CODE:-1":function(){return"CityTouchIPT (-1): general application failure."},"log:GLP2:RESETTING_TESTER":function(){return"Resetting the GLP2-I tester..."},"log:GLP2:TEST_STEP_FAILURE":function(r){return"Exceeded set value 1 <code>"+e.v(r,"setValue")+"</code>: <code>"+e.v(r,"actualValue")+"</code> or set value 2: <code>"+e.v(r,"setValue2")+"</code>: <code>"+e.v(r,"actualValue2")+"</code>"},"error:GLP2:SETTING_DISABLED":function(){return"GLP2: Option is disabled in the settings."},"error:GLP2:FEATURE_DISABLED":function(){return"The current license doesn't have the Tester GLP2-I option."},"error:GLP2:TESTER_NOT_READY":function(){return"GLP2: Tester is not ready."},"error:GLP2:RESETTING_TESTER_FAILURE":function(){return"GLP2: Resetting the tester failed."},"error:GLP2:PROGRAM_NOT_RECOGNIZED":function(){return"GLP2: Program not recognized."},"error:GLP2:UNEXPECTED_RESPONSE":function(){return"GLP2: Unexpected response from the tester."},"error:GLP2:TEST_STEP_FAILURE":function(){return"GLP2: Test step failed."},"error:GLP2:BUSY_TESTER":function(){return"GLP2: Tester is busy or requires a BlackBox test."},"error:GLP2:INVALID_CHECKSUM":function(){return"GLP2: Invalid response checksum from the tester."},"error:GLP2:INVALID_PARAMETERS":function(){return"GLP2: Invalid tester parameters."},"error:GLP2:INVALID_RESPONSE":function(){return"GLP2: Invalid response from the tester."},"error:GLP2:NO_CONNECTION":function(){return"GLP2: No connection to the tester."},"error:GLP2:RESPONSE_TIMEOUT":function(){return"GLP2: Response timed out."},"error:GLP2:FAULT:1":function(){return"GLP2 (1): Safety contact interrupted."},"error:GLP2:FAULT:2":function(){return"GLP2 (2): Fuse defective."},"error:GLP2:FAULT:3":function(){return"GLP2 (3): No test step defined."},"error:GLP2:FAULT:4":function(){return"GLP2 (4): Voltage substitute leakage current not OK."},"error:GLP2:FAULT:5":function(){return"GLP2 (5): Short circuit at test object."},"error:GLP2:FAULT:6":function(){return"GLP2 (6): Error at voltage control."},"error:GLP2:FAULT:7":function(){return"GLP2 (7): Data error."},"error:GLP2:FAULT:8":function(){return"GLP2 (8): Below minimum current at LKC."},"error:GLP2:FAULT:9":function(){return"GLP2 (9): Cancelled."},"error:GLP2:FAULT:10":function(){return"GLP2 (10): Below minimum voltage HV."},"error:GLP2:FAULT:11":function(){return"GLP2 (11): Maximum voltage HV exceeded."},"error:GLP2:FAULT:12":function(){return"GLP2 (12): Below minimum current HV."},"error:GLP2:FAULT:13":function(){return"GLP2 (13): Communication error at HV electronics."},"error:GLP2:FAULT:14":function(){return"GLP2 (14): HV voltage check failed."},"error:GLP2:FAULT:15":function(){return"GLP2 (15): Test program doesn't exist."},"error:GLP2:FAULT:16":function(){return"GLP2 (16): Adjusting error at high-voltage test."},"error:GLP2:FAULT:17":function(){return"GLP2 (17): U max fuse of leakage-current test EN60601 has triggered."},"error:GLP2:FAULT:18":function(){return"GLP2 (18): Test object is still under voltage (between L-N)"},"error:GLP2:FAULT:19":function(){return"GLP2 (19): Mains plug twisted (when testing without isolating transformer)."},"error:GLP2:FAULT:20":function(){return"GLP2 (20): PE of mains lead is missing."},"error:GLP2:FAULT:21":function(){return"GLP2 (21): Printer at the parallel port (LPT1) not ready!"},"error:GLP2:FAULT:22":function(){return"GLP2 (22): High voltage disabled (key switch)."},"error:GLP2:FAULT:23":function(){return"GLP2 (23): Thermo switch of high voltage has triggered."},"error:GLP2:FAULT:24":function(){return"GLP2 (24): The device is not enabled for operation."},"error:GLP2:FAULT:25":function(){return"GLP2 (25): Maximum primary current of the HV-test."},"error:GLP2:FAULT:26":function(){return"GLP2 (26): The phase of the external FCT voltage is not existing or is polarized incorrectly."},"error:GLP2:FAULT:27":function(){return"GLP2 (27): Automatic closing of the protection cover error."},"error:GLP2:FAULT:28":function(){return"GLP2 (28): No test object."},"error:GLP2:FAULT:29":function(){return"GLP2 (29): Test sequence has reported an error."},"error:GLP2:FAULT:30":function(){return"GLP2 (30): Temperature regulation error (test step TMP)."},"error:GLP2:FAULT:31":function(){return"GLP2 (31): FI reference test error."},"settings:tab:clients":function(){return"Clients"},"settings:tab:notifier":function(){return"Notifications"},"settings:appVersion":function(){return"Current version of the Walkner Xiconf app"},"settings:notifier:enabled":function(){return"Notifications enabled"},"settings:notifier:emptyLeds":function(){return"Notify about orders without drivers and with no LED boards scanned"},"settings:notifier:delay":function(){return"Notification delay [min]"},"settings:notifier:nameFilter":function(){return"Ignore notifications by product name"}},pl:!0}});