//prepare the canvas 
const c = document.getElementById('previewCanvas');
const ctx = c.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
let words; //holds the list of vocab words
let spaces; //holds the placement grid

//preload images
let images = [];
const imgSrcs = [
    'img/dino.png',
    'img/fly.png',
    'img/chick.png',
    'img/cat.png'
];
for (let src in imgSrcs) {
    images[src] = new Image();
    images[src].src = imgSrcs[src];
}

//Space class provides utility to be used for random placement of words
class Space {
    constructor(r, c) {
        this.row = r;
        this.col = c;
        this.x = 55 * c + 55;
        this.y = 50 * r + 50;
    }

    // removes the surrounding spaces from the placement grid to prevent overlapping
    spliceNeighbors(randR, randC) {
        for (let i = spaces.length - 1; i >= 0; i--) {
            for (let j = spaces[i].length - 1; j >= 0; j--) {
                if (spaces[i][j].col <= this.col + 1
                    && spaces[i][j].col >= this.col - 1
                    && spaces[i][j].row <= this.row + 1
                    && spaces[i][j].row >= this.row - 1) {
                    spaces[i].splice(j, 1);
                }
            }
            if (spaces[i].length == 0) {
                spaces.splice(i, 1);
            }
        }
    }
}

//initialize the event listeners for the buttons
document.getElementById('create').addEventListener('click', function () { createGame(c, ctx); });
document.getElementById('shuffle').addEventListener('click', function () {
    try {
        drawAllWords(words, c, ctx);
    } catch (error) {
        console.log(error)
        alert('Please create a game before trying to reshuffle.');
    }
});
document.getElementById('download-button').addEventListener('click', function () {
    let img = c.toDataURL();
    console.log('saved as ' + img);
    let pdf = new jsPDF('p', 'cm', 'letter');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(img, 'JPEG', 1, 1, width - 1, height - 1); //fix scaling
    pdf.save('fly-swatter-maker.pdf');
}, false);
document.getElementById('print-button').addEventListener('click', function () {
    window.print();
}, false);

//draws word at random location and random angle inside space
function drawWord(w, c, ctx) {
    ctx.save();
    let [randR, randC] = randomizePosition();
    if (w.length > 9) {
        const fontSize = Math.floor(Math.random() * 6 + 12) + 'pt Times New Roman';
        ctx.font = fontSize;
    } else {
        const fontSize = Math.floor(Math.random() * 24 + 12) + 'pt Times New Roman';
        ctx.font = fontSize;
    }

    ctx.fillText(w, 0, 0, 100);
    ctx.restore();
    spaces[randR][randC].spliceNeighbors(randR, randC);
}

//shuffles the available spaces to randomly place words
function shuffleSpaces() {
    spaces = [];
    for (let r = 0; r < 15; r++) {
        spaces.push([]);
        for (let c = 0; c < 10; c++) {
            spaces[r].push(new Space(r, c));
        }
    }
}

//moves canvas context to an empty random location and rotation 
function randomizePosition() {
    randR = Math.floor(Math.random() * spaces.length);
    randC = Math.floor(Math.random() * spaces[randR].length);

    ctx.translate(spaces[randR][randC].x, spaces[randR][randC].y);
    ctx.rotate(Math.random() * (Math.PI) * 2);
    return [randR, randC];
}

// draws the bonus image at random free location and angle
function drawImg(c, ctx) {
    ctx.save();
    let [randR, randC] = randomizePosition();
    ctx.drawImage(images[Math.floor(Math.random() * 4)], randC - 20, randR - 20);
    ctx.restore();
    spaces[randR][randC].spliceNeighbors(randR, randC);
}

function createGame(c, ctx) {
    words = setupWordlist();
    drawAllWords(words, c, ctx);

}

/*  the drawAllWords function will draw or redraw all the words in the 
*   list by shuffling the spaces, clearing the screen, and generating each word
*   
*/
function drawAllWords(words, c, ctx) {
    ctx.clearRect(0, 0, c.width, c.height);
    shuffleSpaces();
    //draws random bonus image
    drawImg(c, ctx);
    
    for (word of words) {
        drawWord(word, c, ctx);
    }
}

//the setupWordlist function creates the wordlist when the create button is pressed. 
function setupWordlist() {
    // create new list of words only if create button is pressed. 
    let words = document.getElementById('wordlist').value.split('\n');

    //eliminate empty values
    words = words.filter(word => word != '');

    //truncate lines greater than 20
    if (words.length > 20) {
        console.log("Max word limit is 20. Extra words will be removed.")
        words.splice(20, words.length - 20);
    }

    //write the words back to textarea after formatting
    writebacklist = '';
    for (word of words)
        writebacklist += word + '\n';
    document.getElementById('wordlist').value = writebacklist.trim();
    return words;


}
