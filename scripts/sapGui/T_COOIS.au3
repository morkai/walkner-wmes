#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$inputPath = ReadIni("T_COOIS", "InputPath", ReadIni("Transactions", "InputPath", "C:\SAP\Input"))
$outputPath = ReadIni("T_COOIS", "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni("T_COOIS", "OutputFile", "T_COOIS.txt")
$codePage = ReadIni("T_COOIS", "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$variant = ReadIni("T_COOIS", "Variant", "")
$variantCreator = ReadIni("T_COOIS", "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))
$list = ""
$layout = ""
$ordersFile = ""
$plant = ""
$from = ""
$to = ""
$deleted = "0"

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug("T_COOIS.exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --input-path")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
  LogDebug("  --list")
  LogDebug("  --orders-file")
  LogDebug("  --layout")
  LogDebug("  --plant")
  LogDebug("  --from")
  LogDebug("  --to")
  LogDebug("  --deleted")
  Exit(0)
EndIf

If $CmdLine[0] > 0 And Mod($CmdLine[0], 2) = 0 Then
  For $i = 1 To ($CmdLine[0] - 1) Step 2
    $k = $CmdLine[$i]
    $v = $CmdLine[$i + 1]

    Switch $k
      Case "--input-path"
        $inputPath = $v
      Case "--output-path"
        $outputPath = $v
      Case "--output-file"
        $outputFile = $v
      Case "--code-page"
        $codePage = $v
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
      Case "--list"
        Switch StringUpper($v)
          Case "HEADERS", "PPIOH000"
            $list = "PPIOH000"
          Case "COMPONENTS", "PPIOM000"
            $list = "PPIOM000"
          Case "OPERATIONS", "PPIOO000"
            $list = "PPIOO000"
          Case "DOCUMENTS", "DOCUMENT LINKS", "PPIOV000"
            $list = "PPIOV000"
        EndSwitch
      Case "--layout"
        $layout = $v
      Case "--orders-file"
        $ordersFile = $v
      Case "--plant"
        $plant = $v
      Case "--from"
        $from = $v
      Case "--to"
        $to = $v
      Case "--deleted"
        $deleted = $v
    EndSwitch
  Next
EndIf

LogDebug("T_COOIS")
LogDebug("--input-path=" & $inputPath)
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)
LogDebug("--list=" & $list)
LogDebug("--layout=" & $layout)
LogDebug("--orders-file=" & $ordersFile)
LogDebug("--plant=" & $plant)
LogDebug("--from=" & $from)
LogDebug("--to=" & $to)
LogDebug("--deleted=" & $deleted)

#include "_Logon.au3"

StartTransaction("COOIS")

SetVariant($session, $variant, $variantCreator)

If $list <> "" Then
  $session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/cmbPPIO_ENTRY_SC1100-PPIO_LISTTYP").Key = $list
EndIf

If $layout <> "" Then
  $session.FindById("wnd[0]/usr/ssub%_SUBSCREEN_TOPBLOCK:PPIO_ENTRY:1100/ctxtPPIO_ENTRY_SC1100-ALV_VARIANT").Text = $layout
EndIf

If $plant <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/ctxtS_WERKS-LOW").Text = $plant
EndIf

If $from <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/ctxtS_TERST-LOW").Text = $from
EndIf

If $to <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/ctxtS_TERST-HIGH").Text = $to
EndIf

If $deleted = "1" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/chkP_LOEKZ").Selected = True
EndIf

If $ordersFile <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/ctxtS_AUFNR-LOW").SetFocus()
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/btn%_S_AUFNR_%_APP_%-VALU_PUSH").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[23]").Press()
  $session.FindById("wnd[2]/usr/ctxtDY_PATH").Text = $inputPath
  $session.FindById("wnd[2]/usr/ctxtDY_FILENAME").Text = $ordersFile
  $session.FindById("wnd[2]/tbar[0]/btn[0]").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[8]").Press()
EndIf

; Execute
$session.FindById("wnd[0]/tbar[1]/btn[8]").Press()

; Check for no data Information window
$win = $session.FindById("wnd[1]")

If IsObj($win) And $win.Text = "Information" Then
  $win.Close()
  CloseSession()
  LogDebug("NO_DATA")
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
