#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$t = "T_DP_BOM"

$outputPath = ReadIni($t, "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni($t, "OutputFile", $t & ".txt")
$codePage = ReadIni($t, "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$inputPath = ReadIni($t, "InputPath", ReadIni("Transactions", "InputPath", "C:\SAP\Input"))
$orderFile = ReadIni($t, "OrderFile", "")
$componentFile = ReadIni($t, "ComponentFile", "")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & ".exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --input-path")
  LogDebug("  --order-file")
  LogDebug("  --component-file")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--input-path"
        $inputPath = $v
      Case "--order-file"
        $orderFile = $v
      Case "--component-file"
        $componentFile = $v
    EndSwitch
  Next
EndIf

LogDebug($t)
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--input-path=" & $inputPath)
LogDebug("--order-file=" & $orderFile)
LogDebug("--component-file=" & $componentFile)

#include "_Logon.au3"

StartTransaction("COOIS")

; Select Components
$session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/cmbPPIO_ENTRY_SC1100-PPIO_LISTTYP").Key = "PPIOM000"

; Change layout
$session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/ctxtPPIO_ENTRY_SC1100-ALV_VARIANT").Text = "000000000001"
$session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/ctxtPPIO_ENTRY_SC1100-ALV_VARIANT").SetFocus()
$session.FindById("wnd[0]").SendVKey(0)

; Load orders from a file
If $orderFile <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/btn%_S_AUFNR_%_APP_%-VALU_PUSH").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[16]").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[23]").Press()
  $session.FindById("wnd[2]/usr/ctxtDY_PATH").Text = $inputPath
  $session.FindById("wnd[2]/usr/ctxtDY_FILENAME").Text = $orderFile
  $session.FindById("wnd[2]/tbar[0]/btn[0]").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Check for a possible No data modal
$modal = $session.FindById("wnd[1]")

If IsObj($modal) Then
  $modal.Close()
  LogDebug("NO_DATA")
  CloseSession()
  Exit(0)
EndIf

; Set component filter
If $componentFile <> "" Then
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").SetCurrentCell(-1, "MATNR")
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").SelectColumn("MATNR")
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").ContextMenu()
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").SelectContextMenuItem("&FILTER")
  $session.FindById("wnd[1]/usr/ssub%_SUBSCREEN_FREESEL:SAPLSSEL:1105/btn%_%%DYN001_%_APP_%-VALU_PUSH").Press()
  $session.FindById("wnd[2]/tbar[0]/btn[16]").Press()
  $session.FindById("wnd[2]/tbar[0]/btn[23]").Press()
  $session.FindById("wnd[3]/usr/ctxtDY_PATH").Text = $inputPath
  $session.FindById("wnd[3]/usr/ctxtDY_FILENAME").text = $componentFile
  $session.FindById("wnd[3]/tbar[0]/btn[0]").Press()
  $session.FindById("wnd[2]/tbar[0]/btn[8]").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
EndIf

; Save to file (replace)
If IsObj($session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell")) Then
  LogDebug("SAVING_TO_FILE")
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarButton("&NAVIGATION_PROFILE_TOOLBAR_EXPAND")
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarContextButton("&MB_EXPORT")
  $session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").selectContextMenuItem("&PC")
  $session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
  $session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
  $session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
  $session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
  $session.FindById("wnd[1]/tbar[0]/btn[11]").Press()
EndIf

; Close
LogDebug("ENDING_TRANSACTION")
CloseSession()
