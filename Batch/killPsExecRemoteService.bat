@ECHO off



:NETWORK_VARIABLES
:: Login and password for PsExec
set USR=BEAKUS\Crew
set PWD=GoBeak11

SET KILL=aerender.exe

set node1=BEAK20
set node2=BEAK21
set node3=BEAK22
set node4=BEAK23
set node5=BEAK24
set node6=BEAK99
set node7=
set node8=
set node9=
set node10=
set SLAVES=%node1%,%node2%,%node3%,%node4%,%node5%,%node7%,%node8%,%node9%,%node10%
set ALL=%node1%,%node2%,%node3%,%node4%,%node5%,%node6%,%node7%,%node8%,%node9%,%node10%

:: Where is this .bat file located?
set BAT=\\hero\Jobs\Sky - Penny Dreadful\05_ANIMATION\AE_CC_SUBMIT.bat



ECHO ================================================================================
ECHO 	%JOB%
ECHO 	%SCENEPOOL%
echo.
echo 	File currently set: !tmp!
echo.
ECHO ================================================================================

:BEGINNING

echo.
echo Kill render
echo The available options are:
echo.
echo ALL
echo SLAVES
echo %NODE6%
echo %NODE1%
echo %NODE2%
echo %NODE3%
echo %NODE4%
echo %NODE5%
echo %NODE7%
echo %NODE8%
echo %NODE9%
echo %NODE10%

echo.
set /p choice="TYPE OPTION: "

if "'%choice%'"=="'ALL'" goto ALL
if "'%choice%'"=="'SLAVES'" goto SLAVES

:CHOICE
pskill -t \\%choice% -u %USR% -p %PWD% -i -d %KILL%
echo Chosen %choice%
goto END

:ALL
psexec -h \\%ALL% -u %USR% -p %PWD% -i -d %KILL% 
echo Chosen ALL
goto END

:SLAVES
psexec -h \\%SLAVES% -u %USR% -p %PWD% -i -d %KILL% 
echo Chosen SLAVES

:END
