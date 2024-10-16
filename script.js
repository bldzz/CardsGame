let deckId;
let playerScore = 0;
let dealerScore = 0;
const playerHand = [];
const dealerHand = [];

const newGameBtn = document.getElementById("new-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");
const resultMessage = document.getElementById("result-message");

newGameBtn.addEventListener("click", startNewGame);
hitBtn.addEventListener("click", playerHit);
standBtn.addEventListener("click", dealerTurn);

async function startNewGame() {
    const deck = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1").then(res => res.json());
    deckId = deck.deck_id;
    playerScore = 0;
    dealerScore = 0;
    playerHand.length = 0;
    dealerHand.length = 0;

    document.getElementById("player-hand").innerHTML = "";
    document.getElementById("dealer-hand").innerHTML = "";
    document.getElementById("player-score").textContent = "0";
    document.getElementById("dealer-score").textContent = "0";
    resultMessage.textContent = "";

    drawCard("player");
    drawCard("dealer");
    drawCard("player");
    drawCard("dealer", true);

    hitBtn.disabled = false;
    standBtn.disabled = false;
}

async function drawCard(player, hide = false) {
    const cardData = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`).then(res => res.json());
    const card = cardData.cards[0];
    const cardValue = getCardValue(card.value);
    const cardImage = document.createElement("img");
    cardImage.src = card.image;
    cardImage.classList.add("w-16", "h-auto", "rounded-lg");

    if (player === "player") {
        playerHand.push(card);
        playerScore += cardValue;
        document.getElementById("player-hand").appendChild(cardImage);
        document.getElementById("player-score").textContent = playerScore;
        if (playerScore > 21) endGame("You busted! Dealer wins.");
    } else {
        dealerHand.push(card);
        dealerScore += cardValue;
        cardImage.classList.add("dealer-card");
        if (hide) {
            cardImage.src = "https://deckofcardsapi.com/static/img/back.png"; // Hides dealer's second card initially
        }
        document.getElementById("dealer-hand").appendChild(cardImage);
        document.getElementById("dealer-score").textContent = dealerScore;
    }
}

function getCardValue(value) {
    if (["KING", "QUEEN", "JACK"].includes(value)) return 10;
    if (value === "ACE") return 11;
    return parseInt(value);
}

function playerHit() {
    drawCard("player");
    if (playerScore > 21) {
        hitBtn.disabled = true;
        standBtn.disabled = true;
    }
}

function dealerTurn() {
    hitBtn.disabled = true;
    standBtn.disabled = true;
    const hiddenCard = document.querySelector(".dealer-card");
    hiddenCard.src = dealerHand[1].image;
    dealerScore = dealerHand.reduce((acc, card) => acc + getCardValue(card.value), 0);
    document.getElementById("dealer-score").textContent = dealerScore;

    const dealerDraw = setInterval(() => {
        if (dealerScore < 17) {
            drawCard("dealer");
        } else {
            clearInterval(dealerDraw);
            endGame(determineWinner());
        }
    }, 1000);
}

function determineWinner() {
    if (dealerScore > 21 || playerScore > dealerScore) return "You win!";
    if (playerScore === dealerScore) return "It's a tie!";
    return "Dealer wins!";
}

function endGame(message) {
    resultMessage.textContent = message;
    hitBtn.disabled = true;
    standBtn.disabled = true;
}
