# RO
## Joc Asteroizi
### Descriere: 
Realizarea unui joc similar cu Asteroizi (https://en.wikipedia.org/wiki/Asteroids_(video_game)) 
utilizând controlul de tip <canvas> sau controlul de tip <svg>. 
În cazurile în care regulile standard diferă de regulile din cerințele de mai jos trebuie implementată varianta din cerințe.
- 1p - implementare asteroizi (reprezentați sub formă de cerc): 
fiecare asteroid va avea asociată o valoare generată aleator în intervalul 1-4, 
indicând numărul de rachete necesar pentru distrugerea acestuia. 
Numărul de rachete necesare va fi afișat în permanență în cadrul desenului utilizat pentru asteroid. 
Culoarea și dimensiunea asteroidului se vor modifica în funcție de acest număr. 
Asteroizii se vor deplasa pe traiectorii liniare cu o viteză determinată aleator.
- 1p - implementare navă spațială desenată sub formă de triunghi; nava va putea fi controlată cu ajutorul 
următoarelor comenzi din tastatură: 
săgeți (deplasare navă sus / jos / stânga / dreapta cu o viteză constantă), 
z – rotire spre stânga, 
c – rotire spre dreapta, 
x – lansare rachetă în direcția în care este orientată nava; 
nava se poate deplasa în toate cele patru direcții indiferent de orientarea curentă.
- 1p - implementare rachete: se va reprezenta racheta pe parcursul deplasării de la nava spațială la asteroid. 
Se va asigura detecția coliziunii cu asteroidul și modificarea numărului de rachete necesar pentru distrugerea acestuia.
Sunt permise maxim 3 rachete lansate simultan.
- 0.5p - coliziune între asteroizi: coliziunea dintre doi asteroizi va determina modificarea traiectoriei acestora
- 1p - coliziune între nava spațială și asteroizi: va determina reducerea numărului de “vieți” și repornirea jocului, 
până când numărul de vieți devine 0.
- 1p - regenerare număr vieți: la distrugerea fiecărui asteroid jucătorul va obține un număr de puncte. 
La atingerea unui număr predefinit de puncte, se va actualiza numărul de ”vieți”.
- 1p - posibilitate control joc utilizând touchscreen 
- 1p - stocarea celor mai bune 5 scoruri obținute și a numelui jucătorilor cu ajutorul Web Storage API (sau a unui alt API similar)

# EN
## Asteroids Game
### Description: 
Creating a game similar to Asteroids (https://en.wikipedia.org/wiki/Asteroids_(video_game)) using either the <canvas> or <svg> control.
In cases where standard rules differ from the requirements below, the version specified in the requirements must be implemented.
- 1 point - Asteroid implementation (represented as circles): each asteroid will have an associated randomly generated value in the range 1-4, 
indicating the number of rockets required to destroy it. 
The required number of rockets will be permanently displayed within the drawing used for the asteroid. 
The color and size of the asteroid will change based on this number. 
Asteroids will move along linear trajectories at a randomly determined speed.
- 1 point - Spaceship implementation drawn as a triangle; the ship can be controlled using the following keyboard commands: 
arrows (move ship up / down / left / right at a constant speed), 
z - rotate left, 
c - rotate right, 
x - launch rocket in the direction the ship is facing; 
the ship can move in all four directions regardless of its current orientation.
- 1 point - Rocket implementation: the rocket will be represented during its movement from the spaceship to the asteroid. 
Collision detection with the asteroid will be ensured, and the number of rockets required to destroy it will be modified. 
A maximum of 3 rockets launched simultaneously is allowed.
- 0.5 points - Collision between asteroids: the collision between two asteroids will determine a modification of their trajectories.
- 1 point - Collision between the spaceship and asteroids: it will reduce the number of "lives" and restart the game until the number of lives becomes 0.
- 1 point - Lives regeneration: upon destroying each asteroid, the player will earn a certain number of points. 
Upon reaching a predefined number of points, the number of "lives" will be updated.
- 1 point - Touchscreen game control possibility.
- 1 point - Storing the top 5 obtained scores and player names using the Web Storage API (or a similar API).
