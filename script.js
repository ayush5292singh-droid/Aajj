/* =========================================================
   JARVIS v3
   VOICE + SPEAKING + WAKE MODE + WEB NAVIGATION
   + MANUAL COMMANDS
========================================================= */


/* ELEMENTS */

const micButton =
    document.getElementById("micButton");

const micText =
    document.getElementById("micText");

const micIcon =
    document.getElementById("micIcon");

const micState =
    document.getElementById("micState");

const state =
    document.getElementById("state");

const transcript =
    document.getElementById("transcript");

const recognitionState =
    document.getElementById("recognitionState");

const commandInput =
    document.getElementById("commandInput");

const sendButton =
    document.getElementById("sendButton");

const wakeButton =
    document.getElementById("wakeButton");

const stopMic =
    document.getElementById("stopMic");

const stopSpeech =
    document.getElementById("stopSpeech");

const log =
    document.getElementById("log");

const clearLog =
    document.getElementById("clearLog");

const commandTotal =
    document.getElementById("commandTotal");

const statCommands =
    document.getElementById("statCommands");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceEngine =
    document.getElementById("voiceEngine");

const voiceBar =
    document.getElementById("voiceBar");

const neuralValue =
    document.getElementById("neuralValue");

const neuralBar =
    document.getElementById("neuralBar");

const uptime =
    document.getElementById("uptime");


/* VARIABLES */

let recognition = null;

let listening = false;

let wakeMode = false;

let processing = false;

let commandCount = 0;

let uptimeSeconds = 0;


/* =========================================================
   CLOCK
========================================================= */

function clock(){

    document.getElementById("clock")
        .textContent =
        new Date().toLocaleTimeString();

}

setInterval(clock,1000);
clock();


/* =========================================================
   PARTICLES
========================================================= */

const particleContainer =
    document.getElementById("particles");

for(let i=0;i<55;i++){

    const p =
        document.createElement("div");

    p.className =
        "particle";

    p.style.left =
        Math.random()*100 + "%";

    p.style.animationDuration =
        (8 + Math.random()*18) + "s";

    p.style.animationDelay =
        Math.random()*15 + "s";

    particleContainer.appendChild(p);

}


/* =========================================================
   UPTIME
========================================================= */

setInterval(()=>{

    uptimeSeconds++;

    const h =
        Math.floor(uptimeSeconds/3600);

    const m =
        Math.floor((uptimeSeconds%3600)/60);

    const s =
        uptimeSeconds%60;

    uptime.textContent =
        String(h).padStart(2,"0") + ":" +
        String(m).padStart(2,"0") + ":" +
        String(s).padStart(2,"0");

},1000);


/* =========================================================
   LOG
========================================================= */

function addLog(type,text){

    const row =
        document.createElement("div");

    row.className =
        "log-line";

    const time =
        new Date().toLocaleTimeString();

    let cls =
        "log-system";

    if(type==="USER")
        cls="log-user";

    if(type==="JARVIS")
        cls="log-jarvis";

    row.innerHTML =
        `<span class="log-time">${time}</span>
         <span class="${cls}">${escapeHTML(text)}</span>`;

    log.prepend(row);

}


function escapeHTML(text){

    const d =
        document.createElement("div");

    d.textContent =
        text;

    return d.innerHTML;

}


/* =========================================================
   JARVIS SPEAKING ENGINE
========================================================= */

function speak(text){

    if(!("speechSynthesis" in window)){

        addLog(
            "SYSTEM",
            "Speech synthesis unavailable."
        );

        return;

    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(text);


    /*
       These settings make JARVIS sound
       slower and deeper.
    */

    utterance.lang =
        "en-IN";

    utterance.rate =
        0.88;

    utterance.pitch =
        0.72;

    utterance.volume =
        1;


    /*
       Try to select a good English voice.
    */

    const voices =
        speechSynthesis.getVoices();


    const preferred =
        voices.find(v =>
            /en-IN|en-US|en-GB/i.test(v.lang)
        );


    if(preferred)
        utterance.voice =
            preferred;


    utterance.onstart =
        ()=>{

            state.textContent =
                "SPEAKING";

            voiceStatus.textContent =
                "SPEAKING";

            voiceEngine.textContent =
                "SPEAKING";

            voiceBar.style.width =
                "100%";

        };


    utterance.onend =
        ()=>{

            if(!listening){

                state.textContent =
                    "SYSTEM READY";

                voiceStatus.textContent =
                    "READY";

                voiceEngine.textContent =
                    "ONLINE";

                voiceBar.style.width =
                    "75%";

            }

        };


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if(SpeechRecognition){

    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        true;

    recognition.maxAlternatives =
        1;


    recognition.onstart =
        ()=>{

            listening=true;

            processing=false;

            document.body
                .classList
                .add("listening");

            micText.textContent =
                "LISTENING";

            micState.textContent =
                "MIC ACTIVE";

            recognitionState.textContent =
                "LISTENING";

            state.textContent =
                "LISTENING";

            voiceStatus.textContent =
                "ACTIVE";

            voiceEngine.textContent =
                "LISTENING";

            voiceBar.style.width =
                "100%";

            transcript.textContent =
                "Listening...";

            addLog(
                "SYSTEM",
                "VOICE CHANNEL OPEN"
            );

        };


    recognition.onresult =
        event=>{

            let text="";


            for(
                let i=event.resultIndex;
                i<event.results.length;
                i++
            ){

                text +=
                    event.results[i][0]
                        .transcript;

            }


            text =
                text.trim();


            if(text){

                transcript.textContent =
                    text;

                animateWave();

            }


            const finalResult =
                event.results[
                    event.results.length-1
                ];


            /*
               THIS IS THE IMPORTANT PART:

               As soon as the browser gives
               the final sentence, JARVIS
               executes it automatically.

               NO EXECUTE BUTTON.
            */

            if(
                finalResult.isFinal &&
                !processing
            ){

                processing=true;

                processVoiceCommand(
                    text
                );

            }

        };


    recognition.onerror =
        event=>{

            console.log(
                "Recognition error:",
                event.error
            );

            listening=false;

            processing=false;

            document.body
                .classList
                .remove("listening");


            micText.textContent =
                "SPEAK";

            micState.textContent =
                "MIC OFF";

            recognitionState.textContent =
                "STANDBY";

            voiceStatus.textContent =
                "READY";

            voiceEngine.textContent =
                "ONLINE";

            voiceBar.style.width =
                "75%";


            if(event.error==="not-allowed"){

                transcript.textContent =
                    "Microphone permission denied. Allow microphone access.";

                addLog(
                    "SYSTEM",
                    "MICROPHONE PERMISSION DENIED"
                );

            }

            else if(event.error==="no-speech"){

                transcript.textContent =
                    "No speech detected.";

            }

            else{

                transcript.textContent =
                    "Voice error: "+event.error;

            }

        };


    recognition.onend =
        ()=>{

            listening=false;

            document.body
                .classList
                .remove("listening");


            micText.textContent =
                "SPEAK";

            micState.textContent =
                "MIC OFF";

            recognitionState.textContent =
                "STANDBY";


            /*
               Wake mode keeps listening.
            */

            if(wakeMode){

                setTimeout(()=>{

                    if(
                        wakeMode &&
                        !listening
                    ){

                        startListening();

                    }

                },700);

            }

            else{

                state.textContent =
                    "SYSTEM READY";

                voiceStatus.textContent =
                    "READY";

            }

        };

}
else{

    micButton.disabled=true;

    micText.textContent =
        "UNSUPPORTED";

    transcript.textContent =
        "Voice recognition is not supported in this browser.";

    addLog(
        "SYSTEM",
        "SPEECH RECOGNITION NOT AVAILABLE"
    );

}


/* =========================================================
   START MICROPHONE
========================================================= */

function startListening(){

    if(!recognition){

        alert(
            "Voice recognition is not supported."
        );

        return;

    }


    if(listening)
        return;


    try{

        recognition.start();

    }
    catch(error){

        console.log(error);

    }

}


/* =========================================================
   MIC BUTTON
========================================================= */

micButton.addEventListener(
    "click",
    ()=>{

        if(listening){

            stopMicrophone();

        }
        else{

            startListening();

        }

    }
);


/* =========================================================
   STOP MICROPHONE
========================================================= */

function stopMicrophone(){

    wakeMode=false;

    wakeButton
        .classList
        .remove("active");

    wakeButton.textContent =
        "◉ WAKE MODE: OFF";


    if(recognition){

        try{
            recognition.stop();
        }
        catch(e){}

    }

    listening=false;

    document.body
        .classList
        .remove("listening");

    micText.textContent =
        "SPEAK";

    micState.textContent =
        "MIC OFF";

    voiceStatus.textContent =
        "READY";

    state.textContent =
        "SYSTEM READY";

}

stopMic.addEventListener(
    "click",
    stopMicrophone
);


/* =========================================================
   WAKE MODE
========================================================= */

wakeButton.addEventListener(
    "click",
    ()=>{

        wakeMode =
            !wakeMode;


        if(wakeMode){

            wakeButton
                .classList
                .add("active");

            wakeButton.textContent =
                "◉ WAKE MODE: ON";

            addLog(
                "SYSTEM",
                'WAKE MODE ACTIVE — SAY "JARVIS"'
            );

            transcript.textContent =
                'Wake mode active. Say "Jarvis" and your command.';

            startListening();

        }

        else{

            stopMicrophone();

        }

    }
);


/* =========================================================
   PROCESS VOICE
========================================================= */

function processVoiceCommand(text){

    let command =
        text.trim();


    /*
       Remove wake word.
    */

    command =
        command.replace(
            /^(hey\s+)?jarvis[\s,:-]*/i,
            ""
        );


    /*
       If user only says JARVIS,
       answer them.
    */

    if(!command){

        addLog(
            "JARVIS",
            "Wake word detected."
        );

        speak(
            "Yes. I'm listening."
        );

        return;

    }


    executeCommand(
        command
    );

}


/* =========================================================
   COMMAND ENGINE
========================================================= */

function executeCommand(command){

    command =
        command.trim();


    if(!command)
        return;


    commandCount++;


    commandTotal.textContent =
        String(commandCount)
            .padStart(3,"0");

    statCommands.textContent =
        commandCount;


    transcript.textContent =
        command;

    state.textContent =
        "PROCESSING";


    addLog(
        "USER",
        command
    );


    const lower =
        command.toLowerCase();


    /* TIME */

    if(
        lower.includes("what time") ||
        lower === "time" ||
        lower.includes("current time")
    ){

        const time =
            new Date()
                .toLocaleTimeString(
                    [],
                    {
                        hour:"numeric",
                        minute:"2-digit"
                    }
                );

        respond(
            `The current time is ${time}.`
        );

        return;

    }


    /* DATE */

    if(
        lower.includes("what date") ||
        lower.includes("today's date") ||
        lower.includes("todays date")
    ){

        const date =
            new Date()
                .toLocaleDateString(
                    [],
                    {
                        weekday:"long",
                        month:"long",
                        day:"numeric",
                        year:"numeric"
                    }
                );

        respond(
            `Today is ${date}.`
        );

        return;

    }


    /* GREETING */

    if(
        lower==="hello" ||
        lower==="hi" ||
        lower==="hey"
    ){

        respond(
            "Hello. JARVIS is online."
        );

        return;

    }


    /* OPEN GOOGLE */

    if(
        lower==="open google" ||
        lower==="go to google"
    ){

        navigate(
            "https://www.google.com",
            "Opening Google."
        );

        return;

    }


    /* SEARCH */

    if(
        lower.startsWith("search ") ||
        lower.startsWith("search for ") ||
        lower.startsWith("look up ")
    ){

        let query =
            command
                .replace(/^search for /i,"")
                .replace(/^search /i,"")
                .replace(/^look up /i,"")
                .trim();


        if(!query){

            respond(
                "What should I search for?"
            );

            return;

        }


        const url =
            "https://www.google.com/search?q="+
            encodeURIComponent(query);


        navigate(
            url,
            `Searching for ${query}.`
        );

        return;

    }


    /* OPEN WEBSITE */

    if(
        lower.startsWith("open ") ||
        lower.startsWith("go to ") ||
        lower.startsWith("visit ")
    ){

        const site =
            command
                .replace(/^open /i,"")
                .replace(/^go to /i,"")
                .replace(/^visit /i,"")
                .trim();


        openWebsite(site);

        return;

    }


    /* STOP SPEECH */

    if(
        lower.includes("stop speaking") ||
        lower.includes("stop talking") ||
        lower==="be quiet"
    ){

        speechSynthesis.cancel();

        state.textContent =
            "SYSTEM READY";

        addLog(
            "JARVIS",
            "Voice output stopped."
        );

        return;

    }


    /*
       Anything else becomes a
       Google search automatically.
    */

    const searchURL =
        "https://www.google.com/search?q="+
        encodeURIComponent(command);


    navigate(
        searchURL,
        `Searching for ${command}.`
    );

}


/* =========================================================
   WEBSITE ENGINE
========================================================= */

function openWebsite(site){

    site =
        site.trim();


    const aliases = {

        "google":
            "https://www.google.com",

        "google.com":
            "https://www.google.com",

        "youtube":
            "https://www.youtube.com",

        "youtube.com":
            "https://www.youtube.com",

        "github":
            "https://github.com",

        "github.com":
            "https://github.com",

        "wikipedia":
            "https://www.wikipedia.org",

        "wikipedia.org":
            "https://www.wikipedia.org",

        "reddit":
            "https://www.reddit.com",

        "reddit.com":
            "https://www.reddit.com",

        "instagram":
            "https://www.instagram.com",

        "instagram.com":
            "https://www.instagram.com"

    };


    const key =
        site
            .toLowerCase()
            .replace(/\s/g,"");


    if(aliases[key]){

        navigate(
            aliases[key],
            `Opening ${site}.`
        );

        return;

    }


    let url =
        site;


    if(
        !/^https?:\/\//i.test(url)
    ){

        url =
            "https://"+url;

    }


    try{

        const parsed =
            new URL(url);


        if(
            parsed.hostname.includes(".")
        ){

            navigate(
                url,
                `Opening ${site}.`
            );

            return;

        }

    }
    catch(e){}


    /*
       If it isn't a valid website,
       search it.
    */

    navigate(
        "https://www.google.com/search?q="+
        encodeURIComponent(site),

        `Searching for ${site}.`
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(url,message){

    state.textContent =
        "EXECUTING";

    transcript.textContent =
        message;

    addLog(
        "JARVIS",
        message
    );


    /*
       JARVIS SPEAKS BEFORE NAVIGATION.
    */

    speak(message);


    /*
       Then automatically navigates.
       No Execute button.
    */

    setTimeout(
        ()=>{
            window.location.href =
                url;
        },
        850
    );

}


/* =========================================================
   JARVIS RESPONSE
========================================================= */

function respond(message){

    transcript.textContent =
        message;

    addLog(
        "JARVIS",
        message
    );

    state.textContent =
        "SPEAKING";

    speak(message);

}


/* =========================================================
   MANUAL COMMAND
========================================================= */

function sendManualCommand(){

    const command =
        commandInput.value.trim();


    if(!command){

        commandInput.focus();

        return;

    }


    commandInput.value =
        "";


    executeCommand(
        command
    );

}


sendButton.addEventListener(
    "click",
    sendManualCommand
);


commandInput.addEventListener(
    "keydown",
    event=>{

        if(event.key==="Enter"){

            event.preventDefault();

            sendManualCommand();

        }

    }
);


/* =========================================================
   STOP SPEECH
========================================================= */

stopSpeech.addEventListener(
    "click",
    ()=>{

        if(
            "speechSynthesis" in window
        ){

            speechSynthesis.cancel();

        }

        state.textContent =
            listening
                ? "LISTENING"
                : "SYSTEM READY";

        addLog(
            "SYSTEM",
            "JARVIS SPEECH STOPPED"
        );

    }
);


/* =========================================================
   CLEAR LOG
========================================================= */

clearLog.addEventListener(
    "click",
    ()=>{

        log.innerHTML="";

        addLog(
            "SYSTEM",
            "NEURAL LOG CLEARED"
        );

    }
);


/* =========================================================
   AUDIO VISUALIZER
========================================================= */

function animateWave(){

    document
        .querySelectorAll(".audio-wave i")
        .forEach(bar=>{

            bar.style.height =
                (5 + Math.random()*28) +
                "px";

        });

}


/* =========================================================
   LIVE NEURAL TELEMETRY
========================================================= */

setInterval(
    ()=>{

        const value =
            86 +
            Math.floor(
                Math.random()*13
            );

        neuralValue.textContent =
            value+"%";

        neuralBar.style.width =
            value+"%";

    },
    1100
);


/* =========================================================
   STARTUP
========================================================= */

addLog(
    "SYSTEM",
    "JARVIS NEURAL CORE INITIALIZED"
);

addLog(
    "SYSTEM",
    "MECHANICAL HUD SYSTEM ONLINE"
);

addLog(
    "SYSTEM",
    "VOICE SYNTHESIS ONLINE"
);

addLog(
    "SYSTEM",
    "AUTOMATIC COMMAND EXECUTION ONLINE"
);

addLog(
    "SYSTEM",
    "WEB NAVIGATION ENGINE ONLINE"
);

addLog(
    "SYSTEM",
    "JARVIS READY"
);
