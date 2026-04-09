# Lichess 3D

Play on Lichess with a 3D board using Lichess' public API.

## Features

- Fully client side, no server needed
- Login with Lichess (OAuth2 PKCE)
- View ongoing games
- Play games
- Challenge the AI opponent
- Challenge a player
- Create a game seek
- Watch Lichess TV

## Try it out

[This app is hosted on Github Pages](https://yafred.github.io/Lichess3D/)

## Run it on your machine

1. `pnpm install`
1. `pnpm run build`
1. `pnpm run serve` or any other method to serve the app on http://localhost:8000

## Develop against a local chessground checkout

Clone https://github.com/yafred/chessground

To work on both repos together, run:

1. `pnpm run dev`

This starts three processes:

- a TypeScript watch build in `../chessground`
- the Rollup watch build for this app
- `http-server` with caching disabled

## Points of interest

- [ND-JSON stream reader](https://github.com/lichess-org/api-demo/blob/master/src/ndJsonStream.ts)
- [OAuth "Login with Lichess"](https://github.com/lichess-org/api-demo/blob/master/src/auth.ts)
- [Read the main event stream](https://github.com/lichess-org/api-demo/blob/master/src/ctrl.ts)
- [Game play](https://github.com/lichess-org/api-demo/blob/master/src/game.ts)
- [Create a seek and await a game](https://github.com/lichess-org/api-demo/blob/master/src/seek.ts)
- [Challenge a player](https://github.com/lichess-org/api-demo/blob/master/src/challenge.ts)
- [Watch Lichess TV](https://github.com/lichess-org/api-demo/blob/master/src/tv.ts)

Feel free to reuse and learn from this code when building your own Lichess API app.
