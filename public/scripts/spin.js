const reels = document.querySelectorAll(".reel");
const spinButton = document.querySelector(".spin_btn");
const messageDisplay = document.querySelector(".message");
const showButton = document.querySelector(".show_btn");
const closeButton = document.getElementById("close-bigpic");

const APIKEY = "?api-key=candy";
const SERVICEURL = "http://localhost:3000/api";

let myID = "";
let symboles = "";
let reelStates = [];

let responseState = "";

getSymboles();
register();

showButton.addEventListener("click", () => {
    document.getElementById("imageModal").showModal();
})

closeButton.addEventListener("click", () => {
    closeButton.parentElement.close();
});

let spinning = false;
spinButton.addEventListener("click", spinReels);

function spinReels() {
    if (spinning) return;
    showButton.style.display = "none";
    askServer();
    spinning = true;
    messageDisplay.textContent = "Spinning.........";
    reels.forEach((reel, index) => {
        reelStates[index] = symboles.slice()
        setTimeout(() => {
            spinReel(reel, index);
        }, index * 500);
    });
}

function spinReel(reel, index) {
    const spinCount = 10 + Math.floor(Math.random() * 5);
    let currentSpin = 0;
    console.log(spinCount);
    const interval = setInterval(() => {
        if (currentSpin == spinCount - 2) {
            reelStates[index][reelStates[index].length - 1] = responseState[index];
        }
        reelStates[index].unshift(reelStates[index].pop());
        reel.innerHTML = "";
        reelStates[index].forEach((symbol) => {
            const symbolDiv = document.createElement("div");
            symbolDiv.classList.add("symbol");
            if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.test(
                symbol
            )) {
                symbolDiv.textContent = symbol;
            } else {
                var elem = document.createElement("img");
                elem.src = symbol;
                symbolDiv.appendChild(elem);
            }
            reel.appendChild(symbolDiv);
        });
        currentSpin++;
        if (currentSpin >= spinCount) {
            clearInterval(interval);
            if (index === reels.length - 1) {
                spinning = false;
                checkWin();
            }
        }
    }, 50 + index * 50);
}

function checkWin() {
    const [reel1, reel2, reel3] = reelStates.map((reel) => reel[1]);

    if (
        (reel1 === reel2 && reel2 === reel3)
    ) {
        var elem = document.createElement("img");
        elem.id = 'bigpicImg'
        elem.src = reel1;
        var bigpicDiv = document.getElementById("bigpic");
        var child = document.getElementById("bigpicImg");
        if (child) bigpicDiv.removeChild(child);
        bigpicDiv.appendChild(elem);
        setTimeout(() => {
            messageDisplay.textContent = "Gewinner - Zeig dein Bildshirm dem Frackmobilmeister!";
            showButton.style.display = "inline-block";
            document.getElementById("imageModal").showModal();
        }, 400)
    } else {
        messageDisplay.textContent = "Probier's nochmal";
    }
}

function askServer() {
    let requestURL = SERVICEURL + "/spin" + APIKEY;
    fetch(requestURL, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ id: myID }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                console.log(data);
                responseState = data;
            }
        });
}

function register() {
    myID = Cookies.get('myID');
    if (!myID) {
        let requestURL = SERVICEURL + "/register" + APIKEY;
        fetch(requestURL, {
            method: "POST",
            headers: { "Content-type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    myID = data.id;
                    Cookies.set('myID', myID);
                    console.log("My ID from Server: " + myID);
                }
            });
    } else {
        console.log("My ID from Coockies: " + myID);
        let requestURL = SERVICEURL + "/confirm" + APIKEY;
        fetch(requestURL, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ id: myID }),
        });
    }
}

function getSymboles() {
    let requestURL = SERVICEURL + "/symboles" + APIKEY;
    fetch(requestURL, {
        method: "GET",
        headers: { "Content-type": "application/json" },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                symboles = data.symboles;
                reelStates.push(symboles.slice());
                reelStates.push(symboles.slice());
                reelStates.push(symboles.slice());
            }
        });
}