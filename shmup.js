import "./magi.js";

global.game =
{
    // properties
    title: "Shmup",
    mode: 5,
    scale: 16,
    palette: 2,
    fps: 24,

    // sprites
    sprites: {
        ship1: "X2XXXXXX" +
               "222XXXXX" +
               "X222XXXX" +
               "23222XXX" +
               "X222XXXX" +
               "222XXXXX" +
               "X2XXXXXX"
    },

    // variables
    player: { x: 2, y: 10, level: 1 },
    stars: [],
    bullets: [],
    enemies: [],

    // loop
    loop: () => {

        // controls
        if (key.down && game.player.y < canvas.height - 7)
            game.player.y += 1;
        if (key.up && game.player.y > 0)
            game.player.y -= 1;
        if (key.a) match(game.player.level, {
            1: () => game.shoot(game.player.x + 4, game.player.y + 3, 1, 0),
        })

        // update stars
        game.stars.each(star => star.x -= 2);
        game.stars = game.stars.filter(star => star.x > 0);
        game.stars.push({ x: canvas.width - 1, y: math.rand(0, canvas.height) });

        // update bullets
        game.bullets.each(bullet => (bullet.x += bullet.dx, bullet.y += bullet.dy));
        game.bullets = game.bullets.filter(bullet => bullet.x < canvas.width && bullet.y < canvas.height);

        // clear screen
        canvas.clear(0);

        // draw stars
        game.stars.each(star => canvas.pixel(star.x, star.y, 1));

        // draw bullets
        game.bullets.each(bullet =>
            canvas.pixel(bullet.x, bullet.y, 3) ||
            canvas.pixel(bullet.x - bullet.dx, bullet.y - bullet.dy, 2) ||
            canvas.pixel(bullet.x - bullet.dx * 2, bullet.y - bullet.dy * 2, 1));

        // draw player
        canvas.spr8(game.player.x, game.player.y, game.sprites.ship1);
    },

    shoot: (x, y, dx, dy) =>
        game.bullets.push({ x: x, y: y, dx: dx, dy: dy })
};