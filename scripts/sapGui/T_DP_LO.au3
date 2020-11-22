#Region
#AutoIt3Wrapper_Change2CUI=y
#EndRegion

#include "_Common.au3"

$t = "T_DP_LO"

$outputPath = ReadIni($t, "OutputPath", ReadIni("Transactions", "OutputPath", "C:\SAP\Output"))
$outputFile = ReadIni($t, "OutputFile", $t & ".txt")
$codePage = ReadIni($t, "OutputEncoding", ReadIni("Transactions", "OutputEncoding", "4110"))
$inputPath = ReadIni($t, "InputPath", ReadIni("Transactions", "InputPath", "C:\SAP\Input"))
$componentFile = ReadIni($t, "ComponentFile", "")
$orderFile = ReadIni($t, "OrderFile", "")
$variant = ReadIni($t, "Variant", "")
$variantCreator = ReadIni($t, "VariantCreator", ReadIni("Transactions", "VariantCreator", ""))

If $CmdLine[0] = 1 And $CmdLine[1] = "--help" Then
  LogDebug($t & ".exe <arguments>")
  LogDebug()
  LogDebug("Arguments:")
  LogDebug("  --output-path")
  LogDebug("  --output-file")
  LogDebug("  --code-page")
  LogDebug("  --input-path")
  LogDebug("  --component-file")
  LogDebug("  --order-file")
  LogDebug("  --variant")
  LogDebug("  --variant-creator")
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
      Case "--component-file"
        $componentFile = $v
      Case "--order-file"
        $orderFile = $v
      Case "--variant"
        $variant = $v
      Case "--variant-creator"
        $variantCreator = $v
    EndSwitch
  Next
EndIf

LogDebug($t)
LogDebug("--output-path=" & $outputPath)
LogDebug("--output-file=" & $outputFile)
LogDebug("--code-page=" & $codePage)
LogDebug("--input-path=" & $inputPath)
LogDebug("--component-file=" & $componentFile)
LogDebug("--order-file=" & $orderFile)
LogDebug("--variant=" & $variant)
LogDebug("--variant-creator=" & $variantCreator)

#include "_Logon.au3"

LogDebug("STARTING_TRANSATION")

; Start transaction
$session.StartTransaction("COOIS")

SetVariant($session, $variant, $variantCreator)

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

; Load components from a file
If $componentFile <> "" Then
  $session.FindById("wnd[0]/usr/tabsTABSTRIP_SELBLOCK/tabpSEL_00/ssub%_SUBSCREEN_SELBLOCK:PPIO_ENTRY:1200/btn%_S_COMPO_%_APP_%-VALU_PUSH").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[16]").Press()
  $session.FindById("wnd[1]/tbar[0]/btn[23]").Press()
  $session.FindById("wnd[2]/usr/ctxtDY_PATH").Text = $inputPath
  $session.FindById("wnd[2]/usr/ctxtDY_FILENAME").Text = $componentFile
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
