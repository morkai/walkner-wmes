#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$inputPath = ReadIni("T_DOCS", "InputPath", ReadIni("Transactions", "InputPath", "C:\SAP\Input"))
$inputFile = ReadIni("T_DOCS", "InputFile", "T_DOCS.txt")
$outputPath = ReadIni("T_DOCS", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_DOCS", "OutputFile", "T_DOCS.txt")
$codePage = ReadIni("T_DOCS", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$layout = ReadIni("T_DOCS", "Layout", "T_DOCS")

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_DOCS <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --input-path")
  LogDebug("  --input-file")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --layout")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--input-path"
        $inputPath = $v
      Case "--input-file"
        $inputFile = $v
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--layout"
        $layout = $v
    EndSwitch
  Next
EndIf

LogDebug("T_DOCS")
LogDebug("--input-path=" & $inputPath)
LogDebug("--input-file=" & $inputFile)
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--layout=" & $layout)

#include "_Logon.au3"

StartTransaction("COOIS")

$session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/cmbPPIO_ENTRY_SC1100-PPIO_LISTTYP").Key = "PPIOV000"
$session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/ctxtPPIO_ENTRY_SC1100-ALV_VARIANT").Text = $layout
$session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/ctxtS_AUFNR-LOW").SetFocus()
$session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/btn%_S_AUFNR_%_APP_%-VALU_PUSH").Press()
$session.FindById("wnd[1]/tbar[0]/btn[23]").Press()
$session.FindById("wnd[2]/usr/ctxtDY_PATH").Text = $inputPath
$session.FindById("wnd[2]/usr/ctxtDY_FILENAME").Text = $inputFile
$session.FindById("wnd[2]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/tbar[0]/btn[8]").Press()

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Check for no data Information window
$win = $session.FindById("wnd[1]")

If IsObj($win) And $win.Text = "Information" Then
  $win.Close()
  CloseSession()
  LogDebug("NO_DOCS_FOR_ORDERS")
  Exit(0)
EndIf

; Save to file (replace)
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarButton("&NAVIGATION_PROFILE_TOOLBAR_EXPAND")
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").pressToolbarContextButton("&MB_EXPORT")
$session.FindById("wnd[0]/usr/cntlCUSTOM/shellcont/shell/shellcont/shell").selectContextMenuItem("&PC")
TryCloseModal()
$session.FindById("wnd[1]/tbar[0]/btn[0]").Press()
$session.FindById("wnd[1]/usr/ctxtDY_PATH").Text = $outputPath
$session.FindById("wnd[1]/usr/ctxtDY_FILENAME").Text = $outputFile
$session.FindById("wnd[1]/usr/ctxtDY_FILE_ENCODING").Text = $codePage
$session.FindById("wnd[1]/tbar[0]/btn[11]").Press()

$sbarText = $session.findById("wnd[0]/sbar").Text

; Back to main screen
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()
$session.FindById("wnd[0]/tbar[0]/btn[15]").Press()

LogDebug("ENDING_TRANSACTION")

CloseSession()

If $sbarText <> "" And Not StringInStr($sbarText, "bytes transmitted") Then
  LogDebug('"' & $sbarText & '"')
  LogError("ERR_NON_EMPTY_SBAR", $ERR_NON_EMPTY_SBAR)
EndIf
