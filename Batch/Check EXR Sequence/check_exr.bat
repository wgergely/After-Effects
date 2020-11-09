@echo off

::Check EXR
::Gergely Wootsch
::hello@gergely-wootsch.com
::mch_exrCheck.v2.0.exe kindly borrowed from Glasswork's Farmcontrol (Glassworks London)

:bin
set bin=%~dp0bin\mch_exrCheck.v2.0.exe

set tempdir=%~dp0report
IF NOT EXIST "%tempdir%" (
 mkdir "%tempdir%"
)
set temp=%tempdir%\tmp.txt
set sequencecheckreport=%tempdir%\sequencecheckreport.txt
set incompletefiles=%tempdir%\incompletefiles.txt

IF EXIST "%bin%" (
echo INFO: Found mch_exrCheck.v2.0.exe
) ELSE (
echo.
echo -----------------------
echo ERROR: Couldn't find %bin%
echo -----------------------
echo.
pause
GOTO exit
)

::temp
2>nul (
  >>"%temp%" (call )
) && (
	echo file is not locked
) || (
	echo The temp file is locked.
	goto exit
)

GOTO inFile

:inFile
IF [%1]==[] (
	echo -----------------------
	echo ERROR: No file provided
	echo -----------------------
	goto exit
)

IF [%~x1]==[] (
	set inPath=%~1
	goto check
)
Setlocal EnableDelayedExpansion
IF [%~x1]==[.exr] (
	set inPath=%~dp1
	IF !inPath:~-1!==\ SET inPath=!inPath:~0,-1!
	goto check
) ELSE (
	echo.
	echo -----------------------
	echo ERROR: '%~nx1' is not an EXR file
	echo -----------------------
	echo.
	GOTO exit
)
Endlocal

:check
break>"%sequencecheckreport%"
break>"%incompletefiles%"

::Unquote
FOR /F "usebackq delims=" %%u IN ("%inPath%") DO SET inPath=%%u
FOR /F "usebackq delims=" %%v IN ("%bin%") DO SET bin=%%v
FOR /F "usebackq delims=" %%w IN ("%sequencecheckreport%") DO SET sequencecheckreport=%%w
FOR /F "usebackq delims=" %%x IN ("%incompletefiles%") DO SET incompletefiles=%%x
cls
echo Checking Sequence...

Setlocal EnableDelayedExpansion
for /f "delims=|" %%f in ('dir /b /o:n "%inPath%\*.exr"') do (
	"%bin%" "%inPath%\%%f">"%temp%"
	set /p result=<"%temp%"
	echo %inPath%\%%~nxf,!result!>>"%sequencecheckreport%"
)
Endlocal

:parsesequencecheckreport
for /f "usebackq tokens=1,2 delims=," %%a in ("%sequencecheckreport%") do (
	if "%%b"=="incompleteEXR" echo %%a>>"%incompletefiles%"
	if "%%b"=="could not open file or is not an EXR" echo %%a>>"%incompletefiles%"
)

:result
cls
echo INCOMPLETE EXRs
echo ================
for /f %%e in ("%incompletefiles%") do set size=%%~ze
if %size% gtr 0 (
	goto bad
) ELSE (
	goto good
)
:bad
for /f "usebackq tokens=* delims=" %%c in ("%incompletefiles%") do (
	echo %%~nxc
)
:choice
set /P c=DELETE INCOMPLETE EXRS[Y/N]?
if /I "%c%" EQU "Y" goto :delete
if /I "%c%" EQU "N" goto :exit
goto :choice
:delete
for /f "usebackq tokens=* delims=" %%c in ("%incompletefiles%") do (
	del "%%~dpnxc"
)
echo Done.
goto exit
:good
echo All seems fine!
pause

:exit
exit /b