
let xp; // Declare the variable
// Check if xp is undefined or empty (empty string)
if (typeof xp === "undefined" || xp === "") {
    xp = 0; // Set it to zero
}
let level;
if (typeof level === "undefined" || level === "") {
    level = 1; // Set it to zero
}

function sendLev(){
    chrome.runtime.sendMessage({ action: "updateLEV", level });
    let updatedLev = level
    chrome.storage.local.set({level: updatedLev});
    console.log("LEVEL SENT");
}

function sendXP(){
    chrome.runtime.sendMessage({ action: "updateXP", xp });
    if(xp < 0){
        xp = 0;
    }
    if(xp >= 250){
        level += 1;
        levelUp();
    }
    let updatedXp = xp;
    chrome.storage.local.set({xp: updatedXp});
}

function levelUp() {
    sendLev();
    console.log("level logged", level);
    xp = xp - 250;
    if(level%5 === 0 && level < 25){
        chrome.notifications.create({
            title:"level up notify: unlock item",
            message: `Level UP: ${level}! YOU HAVE UNLOCKED AN ITEM`,
            iconUrl: "popup/images/icon.png",
            type: "basic"
        })
    }
    else if(level == 25){
        chrome.notifications.create({
            title:"win notify",
            message: `***** YOU WON!! *****`,
            iconUrl: "popup/images/icon.png",
            type: "basic"
        })
    }
    else{
        chrome.notifications.create({
            title:"level up notify",
            message: `Level UP: ${level}! Advance more levels to unlock an item.`,
            iconUrl: "popup/images/icon.png",
            type: "basic"
        })
    }
}

const ALARM_JOB_NAME = "CHECK_ALARM"
const ALARM_NAME_2 = "TIME_ALARM"

//SECOND ALARM
const createAlarm2 = () => {
    chrome.alarms.create(ALARM_NAME_2, {periodInMinutes: 1.0})
}
const stopAlarm2 = () => {
    chrome.alarms.clear(ALARM_NAME_2);
}

//first alarm
const createAlarm1 = () => {
	chrome.alarms.create(ALARM_JOB_NAME, {periodInMinutes: 1.0 });
}
const stopAlarm1 = () => {
	chrome.alarms.clear(ALARM_JOB_NAME);
}

//i have tabTitle and tabUrl
function queeryTabs(callback){
	let queryOptions = {active: true, lastFocusedWindow: true};
	
	chrome.tabs.query(queryOptions, (tabs) => {
		if (chrome.runtime.lastError) {
			console.error(chrome.runtime.lastError);
			callback(null);
			return;
		}
		
		if(tabs && tabs.length > 0) {
			const activeTab = tabs[0];
        		const tabTitle = activeTab.title;
        		const tabUrl = activeTab.url;
        		
        	
        	console.log("Active Tab Title: ", tabTitle);
        	console.log("Active Tab URL: ", tabUrl);
        	callback({ title: tabTitle, url: tabUrl });
        	}else{
        		console.error("no tab found");
        		callback(null);
        		}
	});
}
//predefined url's
const linksList = [
"https://www.concordia.ca/",
    "https://concordia.udemy.com/",
    "https://en.wikipedia.org/",
    "https://library.concordia.ca/",
    "https://scholar.google.com/",
    "https://ca.linkedin.com/",
    "https://www.jstor.org/",
    "https://moodle.concordia.ca/",
    "https://github.com/",
    "https://www.khanacademy.org/",
    "https://www.canva.com/",
    "https://docs.google.com/",
    "https://drive.google.com/",
    "https://www.duolingo.com/",
    "https://webwork.concordia.ca/",
    "https://www.mathway.com",
    "https://www.symbolab.com",
    "https://www.integral-calculator.com",
    "https://archive.org",
    "https://mail.google.com/",
    "https://calendar.google.com/"
	];

// here add 'bad' submitted links (call from storage) and assign it to an array
let badList = [];
let counter = 0;
chrome.runtime.onMessage.addListener((data) => {
    let {event, inputWebsite} = data
    if(event === 'websiteBlockClick'){
    console.log("bad website received", inputWebsite);
    badList.push(inputWebsite); //error
    console.log("website added to badList: ", badList[counter])
    counter++
    }
})


//ALARMS    

chrome.alarms.onAlarm.addListener((alarm) => {
	console.log("onAlarm schedule code running...")

    if (alarm.name === ALARM_JOB_NAME){
        console.log("ALARM 1");
	    queeryTabs((tabInfo) => {
		    if(tabInfo) {
			    
			    const tabTitle = tabInfo.title;
      			    const tabUrl = tabInfo.url; 
      			
      			    const isMatch = linksList.some(predefinedUrl => tabUrl.includes(predefinedUrl));
                    const isMatchBad = badList.some(predefinedUrl => tabUrl.includes(predefinedUrl));
      			    if (isMatch) {
      				    console.log("URL matched with predefined URL: ", tabUrl);
                        xp += 1;
                        sendXP()
                    
    			    } 
                    else if(isMatchBad){
                        console.log("Bad URL detected: ", tabUrl);
                        xp -=1;
                        sendXP()
                    }
                    else {
     				    console.log("URL did not match any predefined URL.");
    				} 
		    }else{
			    console.log("NO T")
		    }
	    });
    }

    if (alarm.name === ALARM_NAME_2){
        console.log("ALARM 2");
        chrome.notifications.create({
            title:"30 min marker",
            message: '30 minutes working, good job! Remember to take breaks',
            iconUrl: "popup/images/icon.png",
            type: "basic"
       })
       xp +=30;
       sendXP()
    }

});


chrome.runtime.onMessage.addListener(ndata => {
    let {event} = ndata
    if(event == 'resetClick'){
        //if clear
    }
    if(event == 'restClick'){
        handleRest();
    }
    if(event == 'startClick'){
        handleStart();
        
    }

})

let handleStart =() => {
    console.log("start Active")
    createAlarm2()
    createAlarm1()
}

let handleRest = () => {
    console.log("Rest Active")
    stopAlarm2();
    stopAlarm1();
}

chrome.runtime.onMessage.addListener(data=> { //listens to submit tasks button
    let {event, tasks} = data
    if(event == 'tasksSubmitted'){
        handleTaskSubmit(tasks);
    }
})

let handleTaskSubmit = (tasks) => { //logs tasks input upon button pressed
    console.log("Tasks received in background.");
    console.log("Tasks received: ", tasks);
    chrome.storage.local.set(tasks)
    
}

chrome.runtime.onMessage.addListener(data => { //listens to checkboxes
    if(data.event === 'checked1'){
        console.log("checklist 1 IS CHECKED")
        xp += 100;
        sendXP();
    }
    if(data.event === 'unchecked1'){
        console.log("checklist 1 IS UNCHECKED")
        xp -= 100;
        sendXP();
    }
    if(data.event === 'checked2'){
        console.log("checklist 2 IS CHECKED")
        xp += 100;
        sendXP();
    }
    if(data.event === 'unchecked2'){
        console.log("checklist 2 IS UNCHECKED")
        xp -= 100;
        sendXP();
    }
    if(data.event === 'checked3'){
        console.log("checklist 3 IS CHECKED")
        xp += 100;
        sendXP();
    }
    if(data.event === 'unchecked3'){
        console.log("checklist 3 IS UNCHECKED")
        xp -= 100;
        sendXP();
    }
    if(data.event === 'checked4'){
        console.log("checklist 4 IS CHECKED")
        xp += 100;
        sendXP();
    }
    if(data.event === 'unchecked4'){
        console.log("checklist 4 IS UNCHECKED")
        xp -= 100;
        sendXP();
    }
    if(data.event === 'checked5'){
        console.log("checklist 5 IS CHECKED")
        xp += 100;
        sendXP();
    }
    if(data.event === 'unchecked5'){
        console.log("checklist 5 IS UNCHECKED")
        xp -= 100;
        sendXP();
    }
})

//clear task data
function clearData() {
  const keysToRemove = ["task1", "task2", "task3", "task4", "task5"];
  
  chrome.storage.local.remove(keysToRemove, () => {
    console.log("Data cleared from chrome.storage.local:", keysToRemove);
    
    // Optionally, you can also update the input fields to clear their values
    task1Element.value = "";
    task2Element.value = "";
    task3Element.value = "";
    task4Element.value = "";
    task5Element.value = "";
  });
}
//clear points



