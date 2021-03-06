/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
  /* Predefine the variables we'll be using within this scope,
   * create the canvas element, grab the 2D context for that canvas
   * set the canvas elements height/width and add it to the DOM.
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    lastTime,
    nr = 0;

  canvas.width = 505;
  canvas.height = 606;
  doc.body.appendChild(canvas);

  /* This function serves as the kickoff point for the game loop itself
   * and handles properly calling the update and render methods.
   */
  function main() {
    /* Get our time delta information which is required if your game
     * requires smooth animation. Because everyone's computer processes
     * instructions at different speeds we need a constant value that
     * would be the same for everyone (regardless of how fast their
     * computer is) - hurray time!
     */
    var now = Date.now(),
      dt = (now - lastTime) / 1000.0;

    /* Call our update/render functions, pass along the time delta to
     * our update function since it may be used for smooth animation.
     */
    update(dt);
    render();

    /* Set our lastTime variable which is used to determine the time delta
     * for the next time this function is called.
     */
    lastTime = now;

    /* Use the browser's requestAnimationFrame function to call this
     * function again as soon as the browser is able to draw another frame.
     */
    win.requestAnimationFrame(main);
  }

  /* This function does some initial setup that should only occur once,
   * particularly setting the lastTime variable that is required for the
   * game loop.
   */
  function init() {
    start()
    lastTime = Date.now();
    main();
  }

  /* This function is called by init and shows a welcome page where the gamer
   * can read informations about the game, and can choose an avatar.
   * After the gamer selected the avatar the page will disappear and the game  * starts
   */
  function start() {
    document.querySelector('.modal.start').style.display = 'block';
    document.addEventListener('click', select, false);
  }

  function select(e) {
    if (e.target.classList.contains('image_princess')) {
      src = "images/char-princess-girl.png";
      document.querySelector('.modal').style.display = 'none';
    } else if (e.target.classList.contains('image_catgirl')) {
      src = "images/char-cat-girl.png";
      document.querySelector('.modal').style.display = 'none';
    } else if (e.target.classList.contains('image_boy')) {
      src = "images/char-boy.png";
      document.querySelector('.modal').style.display = 'none';
    }
  }

  /* This function is called by main (our game loop) and itself calls all
   * of the functions which may need to update entity's data.
   */
  function update(dt) {
    updateEntities(dt);
    checkCollisions();
    makeEnemies();
  }

  /* This is called by the update function and loops through all of the
   * objects within the allEnemies and allHearts arrays as defined in app.js
   * and calls their update() methods. It will then call the update function
   * for the player and gem object. These update methods should focus purely
   * on updating the data/properties related to the object.
   */
  function updateEntities(dt) {
    allEnemies.forEach(function(enemy) {
      enemy.update(dt);
    });
    allHearts.forEach(function(heart) {
      heart.update(dt);
    });
    gems.update();
    player.update();
  }

  /* This function initially draws the "game level", it will then call
   * the renderEntities function. Remember, this function is called every
   * game tick (or loop of the game engine) because that's how games work -
   * they are flipbooks creating the illusion of animation but in reality
   * they are just drawing the entire screen over and over.
   */
  function render() {
    /* This array holds the relative URL to the image used
     * for that particular row of the game level.
     */
    var rowImages = [
        'images/water-block.png', // Top row is water
        'images/stone-block.png', // Row 1 of 3 of stone
        'images/stone-block.png', // Row 2 of 3 of stone
        'images/stone-block.png', // Row 3 of 3 of stone
        'images/grass-block.png', // Row 1 of 2 of grass
        'images/grass-block.png' // Row 2 of 2 of grass
      ],
      numRows = 6,
      numCols = 5,
      row, col;

    // Before drawing, clear existing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    /* Loop through the number of rows and columns we've defined above
     * and, using the rowImages array, draw the correct image for that
     * portion of the "grid"
     */
    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* The drawImage function of the canvas' context element
         * requires 3 parameters: the image to draw, the x coordinate
         * to start drawing and the y coordinate to start drawing.
         * We're using our Resources helpers to refer to our images
         * so that we get the benefits of caching these images, since
         * we're using them over and over.
         */
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
      }
    }

    renderEntities();
  }

  /* This function is called by the render function and is called on each game
   * tick. Its purpose is to then call the render functions you have defined
   * on your enemy and player entities within app.js
   */
  function renderEntities() {
    /* Loop through all of the objects within the allEnemies and allHearts
     * array, player and gems, and call the render function you have defined.
     */
    allEnemies.forEach(function(enemy) {
      enemy.render();
    });
    allHearts.forEach(function(heart) {
      heart.render();
    });
    gems.render();
    player.render();

  }

  /* This function is called by the checkCollisions function, after all of the
   * hearts(lifes) gone. First it shows a message, and offer to play again the
   * game. When this modal is on, the gamer cannot move the player with the
   * arrows.
   */
  function reset() {
    document.querySelector('.modal.end').style.display = 'block';
    document.addEventListener('click', playAgain, false);
    document.removeEventListener('keyup', keyup);
  }

  /* When the player choose to play again, the game over massage will
   * disappear, and the gamer can move the player again.
   * The allHearts array will refill, and the enemy bugs and the gems have new
   * position.
   * After the first game over the scoretable will appear. It shows how many
   * games the gamer had, and how many points and gems were collected.
   * Finally the gems points and number reset.
   */
  function playAgain(e) {
    document.querySelector('.modal.end').style.display = 'none';
    document.removeEventListener('click', playAgain, false);
    document.addEventListener('keyup', keyup);
    allHearts.splice(0, 0, first, second, third);
    allEnemies.forEach(function(enemy) {
      enemy.x = enemy.xposition[Math.floor(Math.random() * 5)];
    });
    gems.x = gems.xposition[Math.floor(Math.random() * 5)];
    gems.y = gems.yposition[Math.floor(Math.random() * 3)];

    nr += 1;

    const gameName = document.createElement('h4');
    gameName.textContent = 'Game ' + nr;
    document.querySelector('.gameHead').appendChild(gameName);

    const gemResults = document.createElement('h4');
    gemResults.textContent = gems.number;
    document.querySelector('.gemHead').appendChild(gemResults);

    const pointResults = document.createElement('h4');
    pointResults.textContent = gems.point;
    document.querySelector('.pointHead').appendChild(pointResults);

    document.querySelector('.results').style.display = 'grid';
    gems.point = 0;
    gems.number = 0;
  }

  /* This function is called by the update function, and it's
   * handle the collisions of the bug and the player.
   * Every time when a player run into a bug, the player
   * reset their position, and lost one life. When the player lost all
   * of their life, it will call the reset() function.
   */
  function checkCollisions() {
    allEnemies.forEach(function(enemy) {
      if (enemy.x < player.x + player.width &&
        enemy.x + enemy.width > player.x &&
        enemy.y < player.y + player.height &&
        enemy.y + enemy.height > player.y) {
        player.x = 203;
        player.y = 391;
        if (allHearts.length === 3) {
          allHearts.splice(2, 1);
        } else if (allHearts.length === 2) {
          allHearts.splice(1, 1);
        } else if (allHearts.length === 1) {
          allHearts.splice(0, 1);
          reset();
        }
      }
    });
  }

  /* This function is called by the update function.
   * With this we can only use 5 bugs, because when a bug run out of the
   * visible part of the canvas we send it back to
   * the beginning of the canvas. Also, reset the
   * positions, so it won't be boring.
   */
  function makeEnemies() {
    allEnemies.forEach(function(enemy) {
      if (enemy.x > 500) {
        enemy.x = -150;
        enemy.y = enemy.yposition[Math.floor(Math.random() * 3)];
        enemy.x = enemy.xposition[Math.floor(Math.random() * 5)];
      }
    });
  }

  /* Go ahead and load all of the images we know we're going to need to
   * draw our game level. Then set init as the callback method, so that when
   * all of these images are properly loaded our game will start.
   */
  Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',
    'images/char-boy.png',
    'images/Heart.png',
    'images/gem-orange.png',
    'images/gem-blue.png',
    'images/gem-green.png',
    'images/Star.png',
    'images/char-cat-girl.png',
    'images/char-princess-girl.png'
  ]);
  Resources.onReady(init);

  /* Assign the canvas' context object to the global variable (the window
   * object when run in a browser) so that developers can use it more easily
   * from within their app.js files.
   */
  global.ctx = ctx;
})(this);
