
//XP ELEMENT
let xpElement = document.getElementById("XP")

//LEVEL ELEMENT
let levelElement = document.getElementById("levelID")

function updateClock(){
    const clockElement = document.getElementById("clock")
    const cTime = new Date();
    const h = cTime.getHours();
    const m = cTime.getMinutes();
    const s = cTime.getSeconds();

    const formattedTime = `${h<10 ? `0` : ``}${h}:${m<10 ? `0` : ``}${m}:${s<10 ? `0` : ``}${s}`;
    clockElement.innerHTML = formattedTime;
}

//updateClock();
setInterval(updateClock, 1000);

chrome.runtime.onMessage.addListener(ndata => {
    let {action, level} = ndata;
    if (action === "updateLEV"){
        let lpoints = level;
        console.log("Updated Level:", lpoints);
        displayGif(lpoints);
        extendBar(lpoints);
        levelElement.innerHTML = level;
        
    }
})

chrome.storage.local.get("level", function(data) {
    const levValue = data.level !== undefined ? data.level : 1;
    levelElement.innerHTML = levValue
    console.log("level loaded", data.level);
})

chrome.runtime.onMessage.addListener(data => {
    let {action,xp} = data;
    if (action === "updateXP"){
        let xPoints = xp;
        console.log("Updated xp points: ", xPoints)
        xpElement.innerHTML = xPoints;

        let percentage = (xPoints *0.4); // Calculate the percentage based on XP and a maximum of 250 XP
            if (percentage > 100) {
                percentage = 100; // Ensure the percentage doesn't exceed 100%
            }
    
        // Set the width of the XP bar element
        var xpBarElement = document.getElementById("fillBar");
        if (xpBarElement) {
            xpBarElement.style.width = percentage + "%";
        }
        
    }
})

chrome.storage.local.get("xp", function(data) {
    const xpValue = data.xp !== undefined ? data.xp : 0;
    xpElement.textContent = xpValue
    console.log("xp loaded", data.xp);
})

//WEBSITE BLOCKER INPUT ELEMENT & BUTTON
const websiteBlock = document.getElementById("inputForm")
const websiteBlockButton = document.getElementById("blockerButton")

//TASK ELEMENTS
const task1Element = document.getElementById("task1")
const task2Element = document.getElementById("task2")
const task3Element = document.getElementById("task3")
const task4Element = document.getElementById("task4")
const task5Element = document.getElementById("task5")

//CHECKBOX ELEMENTS
const check1Element = document.getElementById("checkTask1")
const check2Element = document.getElementById("checkTask2")
const check3Element = document.getElementById("checkTask3")
const check4Element = document.getElementById("checkTask4")
const check5Element = document.getElementById("checkTask5")
const checkboxes = [check1Element, check2Element, check3Element, check4Element, check5Element];


//BUTTONS
const submitTasksButton = document.getElementById("submitTaskBtn")
const resetButton = document.getElementById("reset")
const restButton = document.getElementById("rest")
const startButton = document.getElementById("start")

//BUTTON TO SUBMIT TASKS
submitTasksButton.onclick = () => {
    const tasks = {
        task1: task1Element.value,
        task2: task2Element.value,
        task3: task3Element.value,
        task4: task4Element.value,
        task5: task5Element.value,
    } 
    chrome.runtime.sendMessage({event: 'tasksSubmitted', tasks})
}


resetButton.onclick = () => {
    chrome.runtime.sendMessage({event: 'resetClick'})
    task1Element.value = "";
    task2Element.value = "";
    task3Element.value = "";
    task4Element.value = "";
    task5Element.value = "";
    const tasks = {
        task1: task1Element.value,
        task2: task2Element.value,
        task3: task3Element.value,
        task4: task4Element.value,
        task5: task5Element.value,
    } 
    chrome.runtime.sendMessage({event: 'tasksSubmitted', tasks})
    resetCheckboxes();
}
restButton.onclick = () =>  {
    
    chrome.runtime.sendMessage({event: 'restClick'})
}
startButton.onclick = () => {
    chrome.runtime.sendMessage({event: 'startClick'})
    //displayGif(levValue);
}

websiteBlockButton.onclick = () => {                    //submit bad website
    let inputWebsite = websiteBlock.value;
    console.log("blocked website logged: ", inputWebsite)
    chrome.runtime.sendMessage({event: 'websiteBlockClick', inputWebsite})
}

//check and save 1
function handleCheckboxClick(index) { return () => { //sends message to background.js for checked/unchecked boxes
        const checkedEvent = `checked${index + 1}`;
        const uncheckedEvent = `unchecked${index + 1}`;
        const isChecked = checkboxes[index].checked;

        if (isChecked) {
            chrome.runtime.sendMessage({ event: checkedEvent });
        } else {
            chrome.runtime.sendMessage({ event: uncheckedEvent });
        }
        const boxState = {};
        boxState[index] = isChecked;
        chrome.storage.local.set(boxState);
    };
}

//takes and saves
checkboxes.forEach((checkbox, index) => {
    checkbox.onclick = handleCheckboxClick(index);
});

chrome.storage.local.get(null, function(data) {
    Object.entries(data).forEach(([index, value]) => {
        if (checkboxes[index]) {
            checkboxes[index].checked = value;
        }
    });
});

//check and undo
function resetCheckboxes() {
    const boxState = {};
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = false; // Uncheck all checkboxes
        boxState[index] = false; // Update the storage state
    });
    
    // Save the updated checkbox states to chrome.storage.local
    chrome.storage.local.set(boxState, () => {
        console.log("Checkbox states reset.");
    });
}

//storage
chrome.storage.local.get(["task1","task2","task3","task4","task5"], (result) =>{
	const {task1,task2,task3,task4,task5} = result;
	if (task1){
		task1Element.value = task1
		console.log("task1 value retrieved: ", task1)
	}
	if (task2){
		task2Element.value = task2
		console.log("task2 value retrieved: ", task2)
	}
	if (task3){
		task3Element.value = task3
		console.log("task3 value retrieved: ", task3)
	}
	if (task4){
		task4Element.value = task4
		console.log("task4 value retrieved: ", task4)
		
	}
	if (task5){
		task5Element.value = task5
		console.log("task5 value retrieved: ", task5)
	}
		
})

const gearBar = {
    5: "fillOne" ,
    10: "fillTwo" ,
    15: "fillThree" ,
    20: "fillFour" ,
    25: "fillFive" ,
};

function extendBar(level) {
    console.log("Gear Extend");
    const gear = gearBar[level];
    if (gear) {
        console.log("Gear Extend");
        const displayElement = document.getElementById(gear);
        if (displayElement) {
            displayElement.style.opacity = "1";
        } else {
            console.log("Display element not found for gear: " + gear);
        }
    } else {
        console.log("No gear found for level: " + level);
    }
    
}


const levelGifs = {
    //1: 'gifs/background1.gif' ,
    5: 'gifs/backgroundSword1.gif' ,
    10: 'gifs/backgroundSword2.gif' ,
    15: 'gifs/backgroundSword3.gif' ,
    20: 'gifs/backgroundSword4.gif' ,
    25: 'gifs/backgroundSword5.gif' ,

}

function displayGif(level){
    console.log("attempted display gif");
    const gif = levelGifs[level];
    const displayElement = document.getElementById("display");
    if(gif){
        displayElement.style.backgroundImage = `url(${gif})`;
        updateLevelAndBackground(level, gif)
    }
}

function updateLevelAndBackground(level, gif) {
    chrome.storage.local.set({ level, gif });
}

chrome.storage.local.get(['level', 'gif'], function(data) {
    const { level, gif } = data;
    if (level && gif) {
        displayGif(level);
    }
});
