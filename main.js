// import necessary modules.
import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';
import readline from 'readline';

// define some vars and arrays.
const obs = new OBSWebSocket();
var MainSec = "TestLower";
var MainScene = "Scene";
var Isprocess = true;
var Volumes = [];
var Inputs = [];

// Question function to receive user input.
function question(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    return new Promise(resolve => {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
}

// User input function for the scene name.
async function handleUserInputScene() {
  try {
    const name = await question('Please enter the scene name: ');
    MainScene=name;
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// User input function for the source name.
async function handleUserInput() {
    try {
      const name = await question('Please enter the speaker source name: ');
      MainSec=name;
      console.log("Processing...");
    } catch (error) {
      console.error('An error occurred:', error);
    }
}


// A function that calculate the sum of an array (Will be used to process the audio signal info). note: this is probably not the best way to figure out the active speaker but it does the job based on the experemints.
function calculateSum(array) {
    if (array.length === 0 || array.some(value => value == null || isNaN(value))) {
        // Return 0 when the array is empty or contains invalid numbers
        return 0;
    }
    const sum = array.reduce((acc, value) => acc + value, 0);
    return  sum;
}

// A function to switch the transform between the currently active source and the main source.
async function setTransform(sceneName,sourceName,MainSec){
    const RespID = await obs.call('GetSceneItemId', {
        'sceneName': sceneName,
        'sourceName': sourceName,
      });
    const sceneItemId = RespID.sceneItemId;
    const response = await obs.call('GetSceneItemTransform', {
        'sceneName': sceneName,
        'sceneItemId': sceneItemId,
      });
      const GetCurrentFocused = await obs.call('GetSceneItemId', {
        'sceneName': sceneName,
        'sourceName': MainSec,
      });
      const CurrentsceneItemId = GetCurrentFocused.sceneItemId;
      const response1 = await obs.call('GetSceneItemTransform', {
        'sceneName': sceneName,
        'sceneItemId': CurrentsceneItemId,
      });
      
      await obs.call('SetSceneItemTransform', {
        'sceneName': sceneName,
        'sceneItemId': sceneItemId,
        'sceneItemTransform':{
            'alignment': response1.sceneItemTransform.alignment,
            'positionX': response1.sceneItemTransform.positionX,
            'positionY': response1.sceneItemTransform.positionY,
            'scaleX': response1.sceneItemTransform.scaleX,
            'scaleY': response1.sceneItemTransform.scaleY,
        },
      });
      
      await obs.call('SetSceneItemTransform', {
        'sceneName': sceneName,
        'sceneItemId': CurrentsceneItemId,
        'sceneItemTransform':{
            'alignment': response.sceneItemTransform.alignment,
            'positionX': response.sceneItemTransform.positionX,
            'positionY': response.sceneItemTransform.positionY,
            'scaleX': response.sceneItemTransform.scaleX,
            'scaleY': response.sceneItemTransform.scaleY,
        },
      });
    return sourceName;
}
// Connect and sub to websocket high-volume events.
async function connectAndSubscribe() {
    try {
        // Connect to OBS WebSocket;
        // Request to receive the high-volume event every 50ms
        await obs.connect('ws://127.0.0.1:4455', undefined, {
        eventSubscriptions: EventSubscription.All | EventSubscription.InputVolumeMeters,
        rpcVersion: 1
        });

        console.log('Subscribed to high-volume events for audio levels.');

    } catch (error) {
        console.error('Failed to connect or subscribe:', error);
    }
}
// Call all functions Asynchronously
async function excAll() {
  await handleUserInputScene();
  await handleUserInput();
  connectAndSubscribe();
}


// Handle the event with volume levels.
obs.on('InputVolumeMeters', async data => {
    Volumes = [];
    Inputs = [];
    data.inputs.forEach(input => {
        const levelsArray = input.inputLevelsMul.flat();
        const Sum = calculateSum(levelsArray);
        Volumes.push(Sum);
        Inputs.push(input.inputName);
    });
    var max = Math.max(...Volumes);
    const indexOfMaxVolume = Volumes.indexOf(max);
    var inputName = Inputs[indexOfMaxVolume];
    if(max>0.3){
        if(Isprocess){
            MainSec = await setTransform(MainScene,inputName,MainSec);
            Isprocess = false;
            setTimeout(()=> Isprocess = true, 2000);
        }
    }
});

// start
excAll();

// Keep the script running
//process.stdin.resume();