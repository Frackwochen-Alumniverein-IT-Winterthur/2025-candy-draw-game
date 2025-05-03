const reels = document.querySelectorAll(".reel");
const spinButton = document.querySelector(".spin_btn");
const messageDisplay = document.querySelector(".message");

const APIKEY = "?api-key=candy";
const SERVICEURL = "http://localhost:3000/api";

let symboles = "";
let reelStates = [];

let responseState = ["3️⃣", "3️⃣", "3️⃣"]

getSymboles();

let spinning = false;

spinButton.addEventListener("click", spinReels);

function spinReels() {
    if (spinning) return;
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
    const [reel1, reel2, reel3] = reelStates.map((reel) => reel[0]);
    const [reel4, reel5, reel6] = reelStates.map((reel) => reel[1]);

    if (
        (reel1 === reel2 && reel2 === reel3) ||
        (reel4 === reel5 && reel5 === reel6)
    ) {
        messageDisplay.textContent = "Winner";
    } else {
        messageDisplay.textContent = "Try Again";
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
            console.log(data)
            if (data) {
                symboles = data.symboles;
                reelStates.push(symboles.slice());
                reelStates.push(symboles.slice());
                reelStates.push(symboles.slice());
            }
        });
}