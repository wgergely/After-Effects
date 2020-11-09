@ECHO OFF
cls
::=======================================================================
:: Written by Gergely Wootsch - 20/05/2014

:: ffmpeg settings

:: -c:v [option] -- libx264 makes a h264 video
:: -profile:v [option]  -- Options are numbers: Proxy, LT, SQ and HQ: 0 is Proxy and 3 is HQ
:: -qscale:v [option ] -- This parameter determines the quality of the resulting prores movie: 0 is best, 32 is worst
:: 9 - 13 gives a good result without exploding the space needed too much. 11 would be a good bet, 9 if a slightly better quality is required.
:: When space is not a problem, go with qscale 5 or less,

set VIDEO=-c:v libx264 -preset slow -crf 12
set AUDIO=-c:a aac -strict experimental -b:a 320k

:: This ensures Quicktime and device compatibility -- e.g. it plays on iPads and iPhones. Hopefully.
set MISC=-pix_fmt yuv420p -profile:v main -level 3.1 

:: Framerate of image sequences
set RATE=-r 25

:: Extension of output file
set EXT=mp4

:: We put this at the end of the moviefile
set SUFFIX=h264

:: ffmpeg location
set FFMPEG=\\hero\apps\FFMPEG\bin\ffmpeg.exe

::=======================================================================
:: Start of script.


set input=%~1
set name=%~n1

::Checking if it is a image sequence
if %~x1==.jpg GOTO SEQUENCE
if %~x1==.JPG GOTO SEQUENCE
if %~x1==.png GOTO SEQUENCE
if %~x1==.exr GOTO SEQUENCE

:: Or is is a video file?
if %~x1==.mov GOTO MOVIE
if %~x1==.avi GOTO MOVIE
if %~x1==.mp4 GOTO MOVIE

echo.
echo Invalid format.
pause
exit


:MOVIE
set output=%~dp1MOVIE\%~n1.%EXT%
mkdir "%~dp1MOVIE"
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

"%FFMPEG%" -i "%input%" %VIDEO% %AUDIO% %MISC% -threads 0 -metadata title="%~n1" "%output%"
goto END

:SEQUENCE
:: Let's work with an image sequence
:: Let's ASSUME there's no more than 4 digits at the end of the filename that contain numbers.
:: Note, FFMPEG only understands sequences that start such as this: 0000/0001 or 00000/00001. 10000 doesn't work. Unless -start_number # is specified
SET LASTCHARACTERS=%name:~-4%

::This loops through the last characters of the file name and deletes all non numeric characters
SETLOCAL ENABLEDELAYEDEXPANSION
SET "string=%LASTCHARACTERS%"

FOR /l %%i IN (70,-1,0) DO CALL :delstring %%i
GOTO :COUNT

:delstring
SET cp=!string:~%1!
IF NOT DEFINED cp GOTO :eof 
ECHO 0123456789|FIND "!string:~%1,1!" >NUL 2>nul
IF NOT ERRORLEVEL 1 GOTO :eof
SET /a cp=%1+1
SET "string=!string:~0,%1!!string:~%cp%!"
GOTO :eof
endLocal & set numbersonly=%string%

:COUNT
:: this counts the length of a variable
Set $Tstring=%string%
for /l %%a in (0,1,9000) do (set $t=!$Tstring:~%%a,1!&if not defined $t (set PADDING=%%a&goto :REST))
:REST

::Set output name and location
cls
echo.
echo Making folders...
mkdir "%~dp1MOVIE"
set output=%~dp1MOVIE\!name:~0,-%PADDING%!%SUFFIX%.%EXT%
set moviename=!name:~0,-%PADDING%!%SUFFIX%
set moviename=%moviename%

:: ATTACH audio if exist
cls
echo.
echo Looking for audio files to attach...
SetLocal EnableDelayedExpansion
@FOR /F "delims=" %%I IN ('DIR "%~dp1*.wav" /A:-D /B /O:D') DO SET audiofile=%%I
@IF exist "%~dp1*.wav" (goto ENDCHECKAUDIO) ELSE (goto MP3)

:MP3
@FOR /F "delims=" %%I IN ('DIR "%~dp1*.mp3" /A:-D /B /O:D') DO SET audiofile=%%I
@IF exist "%~dp1*.mp3" (goto ENDCHECKAUDIO) ELSE (goto NOAUDIO)

:ENDCHECKAUDIO
endlocal & set audiofile=%audiofile%
cls
echo Audiofile found.
echo.
echo Do you want to attach
echo "%audiofile%" ?
echo.
choice /C YN /N /M "y/n :"
if ERRORLEVEL 2 goto NOAUDIO
if ERRORLEVEL 1 goto AUDIO
goto END

:NOAUDIO
echo No audio files found.
set input=%~dp1!name:~0,-%PADDING%!%%0%PADDING%d%~x1
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

"%FFMPEG%" -start_number %LASTCHARACTERS% -i "%input%" %RATE% %VIDEO% %MISC%  -threads 0 -metadata title="%moviename%" "%output%"
goto OPEN

:AUDIO
set input=%~dp1!name:~0,-%PADDING%!%%0%PADDING%d%~x1
echo %input%
echo %~dp1%audiofile%
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

"%FFMPEG%" -start_number %LASTCHARACTERS% -i "%input%" -i "%~dp1%audiofile%" %RATE% %VIDEO% %AUDIO% %MISC% -threads 0 -metadata title="%moviename% with AUDIO" "%output%"
:OPEN
echo.
echo ALL DONE.
echo.

"%output%"

:END
EXIT