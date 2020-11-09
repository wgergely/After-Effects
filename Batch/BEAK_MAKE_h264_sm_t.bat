@ECHO OFF
cls
::=======================================================================
:: Written by Gergely Wootsch - 20/05/2014

:: ffmpeg settings

:: -c:v [option] -- libx264 makes a h264 video
:: -preset [option]  -- ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
:: -crf [option] -- scale is 0-51: where 0 is lossless, 23 is default, and 51 is worst possible.

set VIDEO=-c:v libx264 -preset medium -crf 18
set AUDIO=-c:a aac -strict experimental -b:a 192k

:: This ensures Quicktime and device compatibility -- e.g. it plays on iPads and iPhones. Hopefully.
set MISC=-pix_fmt yuv420p -profile:v main -level 3.1 

:: Timecode
:: Font location - use //FORWARD slashes!
set FONT=//Hero/apps/BEAKUS TOOLS/ffmpeg/Assets/Font/616.ttf
set TIMECODE=drawtext=fontfile='%FONT%':timecode='00\:00\:00\:00':r=25:fontsize=28:x=(w-tw)/2:y=h-(2*lh)+5:fontcolor=white:box=1:boxcolor=0x00000000@1

:: Scale -- default is divided by /2
set SCALE=scale=1920/2:-1

:: Add watermark
set WATERMin=\\hero\apps\BEAKUS TOOLS\ffmpeg\Assets\Watermark\BEAKUS_watermark.png
set WATERMARK=overlay=main_w-overlay_w-10:main_h-overlay_h-10

:: Framerate of image sequences
set RATE=-r 25

:: Extension of output file
set EXT=mp4

:: We put this at the end of the moviefile
set SUFFIX=h264_sm_t

:: ffmpeg location
set FFMPEG=\\hero\apps\BEAKUS TOOLS\ffmpeg\Assets\bin\ffmpeg.exe

::=======================================================================
:: Start of script.


set input=%~1
set name=%~n1

::Checking if it is a image sequence
if %~x1==.jpg GOTO SEQUENCE
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
set output=%~dp1MOVIE\%~n1_%SUFFIX%.%EXT%
mkdir "%~dp1MOVIE"
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

"%FFMPEG%" -i "%input%" -i "%WATERMin%" %VIDEO% %AUDIO% %MISC% -threads 0 -metadata title="%~n1" -filter_complex "[0:v]%SCALE%[scaled],[scaled][1:v]%WATERMARK%:shortest=0[watermarked],[watermarked]%TIMECODE%" "%output%"
goto END

:SEQUENCE
:: Let's work with an image sequence
:: Let's ASSUME there's no more than 4 digits at the end of the filename that contain numbers.
:: Note, FFMPEG only understands sequences that start such as this: 0000/0001 or 00000/00001. 10000 doesn't work.
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
echo Audiofile found
echo.
echo Do you want to attach
echo "%audiofile%" ?
echo.
choice /C YN /N /M "y/n :"
if ERRORLEVEL 2 goto NOAUDIO
if ERRORLEVEL 1 goto AUDIO
goto END

:NOAUDIO
set input=%~dp1!name:~0,-%PADDING%!%%0%PADDING%d%~x1
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

::%FFMPEG%" -loop 1 -i "%input%" -i "%WATERMin%" %RATE% %VIDEO% %MISC% -threads 0 -metadata title="%moviename%" -filter_complex "[0:v]%SCALE%[scaled];[1:v][scaled]"%WATERMARK%":shortest=1[watermark];[scaled][watermark]"%TIMECODE%"[video]" -map "[video]" "%output%"
"%FFMPEG%" -start_number %LASTCHARACTERS% -i "%input%" -i "%WATERMin%" %RATE% %VIDEO% %MISC% -threads 0 -metadata title="%moviename%" -filter_complex "[0:v]%SCALE%[scaled],[scaled][1:v]%WATERMARK%:shortest=0[watermarked],[watermarked]%TIMECODE%[video]" -map "[video]" "%output%"
goto OPEN

:AUDIO
set input=%~dp1!name:~0,-%PADDING%!%%0%PADDING%d%~x1
echo %input%
echo %~dp1%audiofile%
if exist "%output%" del /F "%output%"

cls
echo Loading ffmpeg...

"%FFMPEG%" -start_number %LASTCHARACTERS% -i "%input%" -i "%WATERMin%" -i "%~dp1%audiofile%" %RATE% %VIDEO% %MISC% %AUDIO% -threads 0 -metadata title="%moviename% with AUDIO" -filter_complex "[0:v]%SCALE%[scaled],[scaled][1:v]%WATERMARK%:shortest=0[watermarked],[watermarked]%TIMECODE%" "%output%"
:OPEN
echo.
echo ALL DONE.
echo.

"%output%"

:END
EXIT