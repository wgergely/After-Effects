@ECHO OFF
cls
set globalconfig=\\hero\apps\BEAKUS TOOLS\BEAK_Global_Settings.cmd
call "%globalconfig%"
:: Specifying 'ALL' and 'SLAVES' preset
set NODES=%node1%,%node2%,%node3%,%node4%,%node5%,%node6%,%node7%,%node8%,%node9%,%node10%
::Removing extra unwanted commas
set ALL=%NODES:,,=%
:: We subtract this computer's name from the list so we can render on all OTHER nodes.
CALL set SLAVES=%%ALL:%Computername%=%%

::========================================================================================


:: Parse network and set the currently available PCs into DATA
setLocal enabledelayedexpansion
for /f "tokens=1,2,3,4,5,6,7,8,9,10 delims= " %%A IN ('net view ^|find "\\"') DO (
	set var=%%A
	if defined var set data=!data!!var!
)
endlocal&set data=%data%


for /f "tokens=1,2,3,4,5,6,7,8,9,10 delims=\\" %%A IN ("%DATA%") DO (
	set PCon=%%A %%B %%C %%D %%E %%E %%F %%G %%H %%I
)

for /f "tokens=1,2,3,4,5,6,7,8,9,10 delims=," %%A IN ("%NODES%") DO (
	set PCset=%%A %%B %%C %%D %%E %%E %%F %%G %%H %%I
)

pause

set h=%PCon%
set f=%PCset%

ECHO Looking for %h%
ECHO in %f%
ECHO.
pause

echo.%f% | findstr /C:"%h%" 1>nul

if errorlevel 1 (
  ECHO String "%h%" NOT found in string "%f%"!
) ELSE (
  ECHO String "%h%" found in string "%f%"!
)

ECHO.    

PAUSE
