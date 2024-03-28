# Audio-Activity-Position-Switcher-OBS-Studio
 This is a simple NodeJS code that uses OBS Websocket to switch sources positions based on audio activity.

How to run:

1- install NodeJS LTS (This was tested using NodeJS v20.11.1 on Windows10 x64).  https://nodejs.org/en/download

2- Clone the repositry or download and unzip anywhere on your PC.

3- Start OBS Studio OBS socket on port 4455 with no authintication (You can use auth but you should add the password to main.js in line 111 instead of undefined as follows: 'YOUR_PASS').

4- Run using Launch.bat file.

5- In the command line, enter the scene name and then the main source name.

6- Test by changing the audio activity on each source.


Note: this is so simple use case where you have a big frame for the active speaker and all other sources are in smaller frames, when the audio activity changes it will automatically switch the new active source to be in the big fram and the old active source to the smaller fram.

If you have any problems running it you can start an issue and I will try to assist asap.
