
const canvas = document.getElementById("canvas-joc");
const ctx = canvas.getContext("2d");

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    unghi: 0,
    viteza: 0, 
    vitezaRotatie: 5,
    // indicator pentru tragerea rachetelor
    trage: false, 
};

const asteroizi = [];
const rachete = [];
let scor = 0; 
let vieti = 3;
// numarul de puncte necesare pentru a obtine o viata suplimentara
const punctePentruVieti = 50; 

let numeJucator = "";
let scoruri = [];

const LOCAL_STORAGE_KEY = "scoruri";

const listaScoruri = document.getElementById("lista-scoruri");

function afiseazaScoruri() {
    listaScoruri.innerHTML = "";

    // obtinem scorurile si numele jucatorului din memoria locala (localStorage)
    const scoruriSalvate = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (scoruriSalvate) {
        const dateSalvate = JSON.parse(scoruriSalvate);
        scoruri = dateSalvate.scoruri;
        numeJucator = dateSalvate.numeJucator;
    }

    // sortam scorurile in ordine descrescatoare
    scoruri.sort((a, b) => b.scor - a.scor);

    // afisam scorurile in elementul HTML
    if (scoruri.length > 0) {
        listaScoruri.innerHTML = scoruri
            .map((entry, index) => `<li>${index + 1}. ${entry.name}: ${entry.scor}</li>`)
            .join("");
    } else {
        listaScoruri.innerHTML = "<li>Niciun scor obtinut inca.</li>";
    }
}

function salveazaScoruri() {
    // cautam sa vedem daca jucatorul exista deja in array-ul de scoruri
    const indexJucatorExistent = scoruri.findIndex((entry) => entry.name === numeJucator);

    if (indexJucatorExistent !== -1) {
        // daca jucatorul exista, actualizam doar scorul daca noul scor este mai mare
        if (scor > scoruri[indexJucatorExistent].scor) {
            scoruri[indexJucatorExistent].scor = scor;
        }
    } else {
        // daca jucatorul nu exista, il adaugam
        const jucatorNou = { name: numeJucator, scor };
        scoruri.push(jucatorNou);
    }

    scoruri.sort((a, b) => b.scor - a.scor);

    if (scoruri.length > 5) {
        // retinem doar primele 5 scoruri
        scoruri.length = 5; 
    }

    // salvam scorurile si numele in memoria locala
    const dateSalvate = { numeJucator, scoruri };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dateSalvate));

    afiseazaScoruri();
}


function deseneazaNava() {
    const { x, y, unghi } = ship;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((Math.PI / 180) * unghi);

    // deseneaza conturul navei
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(10, 10);
    ctx.lineTo(-10, 10);
    ctx.closePath();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function deseneazaAsteroizi() {
    for (const asteroid of asteroizi) {
        const { x, y, value } = asteroid;
        ctx.beginPath();
        //pozitie x,pozitie y,raza,umplere,forma de cerc
        ctx.arc(x, y, 10 + value * 10, 0, Math.PI * 2); 
     
        // culori aleatorii pentru asteroizi (nuante de rosu)
        ctx.fillStyle = `rgb(${255 - value * 50}, 0, 0)`; 
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        // valoarea din mijlocul asteroidului
        ctx.fillText(value, x - 5, y + 6); 
    }
}

function generareAsteroid() {
    // generam valoarea asteroidului (1-4)
    const asteroidValue = Math.floor(Math.random() * 4) + 1;
    // pozitia initiala a asteroidului
    const asteroidX = Math.random() * canvas.width; 
     
    //impartim asteroizii astfel incat sa vina si din partea de sus si din partea de jos a ecranului
    //marimea asteroidului(raza) <==> (10 + asteroidValue * 10)
    let asteroidY = 0;
    //sanse de 50% sa fie de sus sau de jos
    if (Math.random() < 0.5) {
        //->vine de sus
        asteroidY = 0 - (10 + asteroidValue * 10);
    } else {
        //->vine de jos
        asteroidY = canvas.height + (10 + asteroidValue * 10);
    }

    // viteza asteroidului
    const vitezaAsteroid = Math.random() * 3 + 1; 

    asteroizi.push({
        initialx: asteroidX,
        initialy:asteroidY,
        x: asteroidX,
        y: asteroidY,
        value: asteroidValue,
        viteza: vitezaAsteroid,
        inColiziune:false
    });
}

function updateAsteroizi() {

    //sansa de 4% sa apara ca sa fie timp suficient intre aparitii
    if (Math.random() < 0.004) {
        generareAsteroid();
    }

    // in functie de pozitia initiala a asteroidului, il vom deplasa pe ecran
    asteroizi.forEach((asteroid, index) => {

        //actualizare pozitie
        if (asteroid.initialy < 0) {
            //(sus->jos)
            asteroid.y += asteroid.viteza;
        }
        if (asteroid.initialy > 0) {
            //(jos->sus)
            asteroid.y -= asteroid.viteza;
        }
        if (asteroid.initialx < 200) {
            //(stanga->dreapta)
            asteroid.x += asteroid.viteza
        }
        if (asteroid.initialx > 600) {
            //(dreapta->stanga)
            asteroid.x -= asteroid.viteza
        }

        // eliminam asteroizii care au iesit din ecran
        if ((asteroid.x < -10 - asteroid.value * 10) || (asteroid.x > canvas.width + (10 + asteroid.value * 10)) || (asteroid.y < -10 - asteroid.value * 10) || (asteroid.y>canvas.height + (10 + asteroid.value * 10))) {
            asteroizi.splice(index, 1); 
        }

    });
}

function deseneazaRachete() {
    for (const rocket of rachete) {
        const { x, y } = rocket;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
    }
}

function verificaColiziuni() {

    //verificare coliziune intre asteroizi
    for (let i = 0; i < asteroizi.length; i++) {
        for (let j = i + 1; j < asteroizi.length; j++) {
            const asteroid1 = asteroizi[i];
            const asteroid2 = asteroizi[j];
    
            const distantaLaPatrat = (asteroid1.x - asteroid2.x) ** 2 + (asteroid1.y - asteroid2.y) ** 2;
            const sumaRaze = 10 + asteroid1.value * 10 + 10 + asteroid2.value * 10;
            const sumaRazeLaPatrat = sumaRaze ** 2;
    
            //comparam cu suma razelor la patrat pentru a evita radicalul
            if (distantaLaPatrat <= sumaRazeLaPatrat) {
                // schimbare directie la coliziune
                asteroid1.initialx = -asteroid1.initialx;
                asteroid1.initialy = -asteroid1.initialy;
                asteroid2.initialx = -asteroid2.initialx;
                asteroid2.initialy = -asteroid2.initialy;
    
                // evitare suprapunere
                const suprapunere = sumaRaze - Math.sqrt(distantaLaPatrat);
                //unghi de suprapunere
                const unghi = Math.atan2(asteroid1.y - asteroid2.y, asteroid1.x - asteroid2.x);
                const deplasamentX = (suprapunere / 2) * Math.cos(unghi);
                const deplasamentY = (suprapunere / 2) * Math.sin(unghi);
    
                //modificam pozitia asteroizilor ca sa nu se suprapuna
                asteroid1.x += deplasamentX;
                asteroid1.y += deplasamentY;
                asteroid2.x -= deplasamentX;
                asteroid2.y -= deplasamentY;
            }
        }
    }

    //verificare coliziune asteroid cu nava
    for (const asteroid of asteroizi) {
        if (!asteroid.inColiziune) {
            const distance = Math.sqrt((ship.x - asteroid.x) ** 2 + (ship.y - asteroid.y) ** 2);
            //distanta trebuie sa fie mai mica decat raza cercului si dimensiunea triunghiului
            if (distance < (20 + asteroid.value * 10)) {
                vieti--;
                asteroid.inColiziune = true;
                if (vieti === 0) {
                    //salvare scor in storage
                    salveazaScoruri();
                    // resetarea scorului si a vietilor
                    vieti = 3;
                    scor = 0;
                }
                ship.x = canvas.width / 2;
                ship.y = canvas.height / 2;
            }else {
                asteroid.inColiziune = false;
            }
        } 
    }

    // verificare daca jucatorul a acumulat suficiente puncte pentru o viata suplimentara
    if (scor >= punctePentruVieti && vieti<3) {
        vieti++;
        scor -= punctePentruVieti;
    }

    //verficare coliziune asteroid cu rachetele navei
    for (let i = rachete.length - 1; i >= 0; i--) {
        const rocket = rachete[i];
        for (let j = asteroizi.length - 1; j >= 0; j--) {
            const asteroid = asteroizi[j];
            const distance = Math.sqrt((rocket.x - asteroid.x) ** 2 + (rocket.y - asteroid.y) ** 2);
            if (distance < 10 + asteroid.value * 10) {
                // eliminam rachetele care au lovit asteroizii
                rachete.splice(i, 1);
                // scadem valoarea asteroidului
                asteroid.value--; 
                if (asteroid.value === 0) {
                    // crestem scorul atunci cand asteroidul este distrus complet
                    scor += 10;
                    // eliminam asteroidul distrus
                    asteroizi.splice(j, 1); 
                }
            }
        }
    }
}

document.addEventListener("keydown", function (event) {
    //gestionare taste apasate
    switch (event.key) {
        case "ArrowUp":
            // miscare in sus
            if (ship.y - 20 > 0)ship.y -= 3; 
            break;
        case "ArrowDown":
            // miscare in jos
            if (ship.y + 12 < canvas.height)ship.y += 3; 
            break;
        case "ArrowLeft":
            // miscare la stanga
            if (ship.x - 10 > 1)ship.x -= 3; 
            break;
        case "ArrowRight":
            // miscare la dreapta
            if (ship.x + 10 < canvas.width)ship.x += 3; 
            break;
        case "z":
            // rotire la stanga
            ship.unghi -= ship.vitezaRotatie; 
            break;
        case "c":
            // rotire la dreapta
            ship.unghi += ship.vitezaRotatie; 
            break;
        case "x":
            if (rachete.length < 3) {
                // calculeaza pozitia rachetei si o adauga in array-ul de rachete
                const rocketX = ship.x + 15 * Math.cos((Math.PI / 180) * (ship.unghi - 90));
                const rocketY = ship.y + 15 * Math.sin((Math.PI / 180) * (ship.unghi - 90));
                rachete.push({
                    x: rocketX,
                    y: rocketY,
                    unghi: ship.unghi,
                });
            }
            break;
    }
});

function update() {
    // sterge canvas-ul
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // actualizeaza pozitia navei pe baza vitezei si unghiului
    ship.x += ship.viteza * Math.cos((Math.PI / 180) * ship.unghi);
    ship.y += ship.viteza * Math.sin((Math.PI / 180) * ship.unghi);

    deseneazaNava();
    deseneazaAsteroizi(); 
    updateAsteroizi();
    deseneazaRachete();

    for (let i = rachete.length - 1; i >= 0; i--) {
        //unghiul initial= 0 (ar trage in dreapta) => scadem 90 de grade
        rachete[i].x += 5 * Math.cos((Math.PI / 180) * (rachete[i].unghi - 90));
        rachete[i].y += 5 * Math.sin((Math.PI / 180) * (rachete[i].unghi - 90));
        // elimina rachetele care ies din ecran
        if (rachete[i].x < 0 || rachete[i].x > canvas.width || rachete[i].y < 0 || rachete[i].y > canvas.height) {
            rachete.splice(i, 1);
        }
    }

    verificaColiziuni();

    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Scor: " + scor, 10, 20);
    ctx.fillText("Vieti: " + vieti, 10, 40);

    // continua animatia
    requestAnimationFrame(update); 
}


//////////////////////TOUCHSCREEN///////////////////////////////
// pentru ecrane < 768px
//swipe pe ecran=>rotatie nava
//apasare butoane=>deplasare si tragere
let touchStartX = null;
let touchStartY = null;

// gestionarea evenimentelor de atingere (touch events)
function handleTouchStart(event) {
    event.preventDefault();

    const touches = event.changedTouches[0];
    touchStartX = touches.clientX;
    touchStartY = touches.clientY;
}

function handleTouchMove(event) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    event.preventDefault();

    const touches = event.changedTouches[0];
    const touchEndX = touches.clientX;
    const touchEndY = touches.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    //pentru controlarea navei
    const sensibilitate = 5; 

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > sensibilitate) {
            // rotire la dreapta
            ship.unghi += ship.vitezaRotatie; 
        } else if (deltaX < -sensibilitate) {
            // rotire la stanga
            ship.unghi -= ship.vitezaRotatie; 
        }
    } else {
        //se roteste in sus sau in jos in functie de unghiul la care se afla initial
        if (ship.unghi > 0) {
            if (deltaY > sensibilitate) {
                ship.unghi += ship.vitezaRotatie;
            } else if (deltaY < -sensibilitate) {
                ship.unghi -= ship.vitezaRotatie;
            }
        } else {
            if (deltaY > sensibilitate) {
                ship.unghi -= ship.vitezaRotatie;
            } else if (deltaY < -sensibilitate) {
                ship.unghi += ship.vitezaRotatie;
            }
        }
    }

    // actualizam coordonatele atingerii initiale pentru urmatoarea miscare
    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

function handleTouchEnd(event) {
    touchStartX = null;
    touchStartY = null;
}

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

const upButton = document.getElementById("buton-sus");
const downButton = document.getElementById("buton-jos");
const leftButton = document.getElementById("buton-stanga");
const rightButton = document.getElementById("buton-dreapta");
const XButton = document.getElementById("xbuton");

let moveInterval = null;

function handleUpButtonTouchStart() {
    moveInterval = setInterval(() => {
        if (ship.y - 20 > 0) ship.y -= 5;
    }, 100);
}

function handleDownButtonTouchStart() {
    moveInterval = setInterval(() => {
        if (ship.y + 12 < canvas.height) ship.y += 5;
    }, 100);
}

function handleLeftButtonTouchStart() {
    moveInterval = setInterval(() => {
        if (ship.x - 10 > 1) ship.x -= 5;
    }, 100);
}

function handleRightButtonTouchStart() {
    moveInterval = setInterval(() => {
        if (ship.x + 10 < canvas.width) ship.x += 5;
    }, 100);
}

function handleButtonTouchEnd() {
    clearInterval(moveInterval);
}

function handleXButton() {
    if (rachete.length < 3) {
        const rocketX = ship.x + 15 * Math.cos((Math.PI / 180) * (ship.unghi - 90));
        const rocketY = ship.y + 15 * Math.sin((Math.PI / 180) * (ship.unghi - 90));
        rachete.push({
            x: rocketX,
            y: rocketY,
            unghi: ship.unghi,
        });
    }
}

//folosim touchstart si touchend in loc de click pentru a putea tine apasat pe buton
upButton.addEventListener("touchstart", handleUpButtonTouchStart);
downButton.addEventListener("touchstart", handleDownButtonTouchStart);
leftButton.addEventListener("touchstart", handleLeftButtonTouchStart);
rightButton.addEventListener("touchstart", handleRightButtonTouchStart);
XButton.addEventListener("touchstart", handleXButton);

upButton.addEventListener("touchend", handleButtonTouchEnd);
downButton.addEventListener("touchend", handleButtonTouchEnd);
leftButton.addEventListener("touchend", handleButtonTouchEnd);
rightButton.addEventListener("touchend", handleButtonTouchEnd);


//////////////////////////////////////////////////////////////////

afiseazaScoruri();

// solicita numele jucatorului la inceputul jocului (la refresh)
numeJucator = prompt("Introduceti numele jucatorului:");

update();

