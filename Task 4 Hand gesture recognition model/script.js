const video =
document.getElementById("video");


const canvas =
document.getElementById("canvas");


const ctx =
canvas.getContext("2d");



let gestureBox =
document.getElementById("gesture");


let commandBox =
document.getElementById("command");


let fpsBox =
document.getElementById("fps");


let historyBox =
document.getElementById("history");



let previousGesture="";

let lastTime =
performance.now();



// =======================
// Load MediaPipe Model
// =======================


const hands =
new Hands({


locateFile:file=>


`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`


});




hands.setOptions({

maxNumHands:1,

modelComplexity:1,

minDetectionConfidence:0.8,

minTrackingConfidence:0.8


});





hands.onResults(results=>{



let now =
performance.now();



fpsBox.innerHTML =

Math.round(

1000/(now-lastTime)

);



lastTime=now;




canvas.width =
video.videoWidth;


canvas.height =
video.videoHeight;




ctx.clearRect(

0,

0,

canvas.width,

canvas.height

);






if(

results.multiHandLandmarks &&
results.multiHandLandmarks.length>0

){



let hand =
results.multiHandLandmarks[0];





// Red Skeleton

drawConnectors(

ctx,

hand,

HAND_CONNECTIONS,

{

color:"red",

lineWidth:5

}

);




// Finger Points

drawLandmarks(

ctx,

hand,

{

color:"cyan",

radius:5

}

);





recognizeGesture(hand);



}

else{


gestureBox.innerHTML =
"No Hand";


commandBox.innerHTML =
"-";


}



});








function recognizeGesture(hand){



let thumb =

Math.abs(hand[4].x-hand[17].x)

>

Math.abs(hand[3].x-hand[17].x);




let index =

hand[8].y < hand[6].y;




let middle =

hand[12].y < hand[10].y;




let ring =

hand[16].y < hand[14].y;




let pinky =

hand[20].y < hand[18].y;






let count =

[thumb,index,middle,ring,pinky]

.filter(Boolean).length;





let gesture="Unknown";

let command="Analyzing";




// Pinch

if(

distance(hand[4],hand[8])

<0.05

){

gesture="🤏 Pinch";

command="Mouse Click";


clickEffect();


}



// Palm

else if(count===5){

gesture="🖐 Open Palm";

command="System Active";

}



// Fist

else if(count===0){

gesture="✊ Fist";

command="Lock Mode";

}



// Thumb

else if(

thumb && count===1

){

gesture="👍 Thumbs Up";

command="Approved";

}



// Pointer

else if(

index && count===1

){

gesture="☝ Pointer";

command="Cursor Control";


movePointer(hand);

}



// Victory

else if(

index &&
middle &&
count===2

){

gesture="✌ Victory";

command="Screenshot Mode";

}






gestureBox.innerHTML =
gesture;



commandBox.innerHTML =
command;





if(

gesture!==previousGesture

){


addHistory(gesture);


speak(command);


previousGesture=gesture;


}



}








function distance(a,b){


return Math.sqrt(

(a.x-b.x)**2 +

(a.y-b.y)**2

);

}








function movePointer(hand){


let pointer =
document.getElementById("pointer");



pointer.style.left =

hand[8].x *
window.innerWidth
+"px";



pointer.style.top =

hand[8].y *
window.innerHeight
+"px";


}









function clickEffect(){


let pointer =
document.getElementById("pointer");



pointer.style.transform =
"scale(2)";



setTimeout(()=>{


pointer.style.transform =
"scale(1)";


},200);


}









function addHistory(text){



let li =
document.createElement("li");


li.innerHTML =
new Date().toLocaleTimeString()

+" - "

+text;



historyBox.prepend(li);



}








function speak(text){


speechSynthesis.cancel();



let voice =
new SpeechSynthesisUtterance(

text

);


speechSynthesis.speak(

voice

);


}









// Start Webcam


const camera =
new Camera(video,{


onFrame:async()=>{


await hands.send({

image:video

});


},


width:640,

height:480


});



camera.start();