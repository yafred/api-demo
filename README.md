# Lichess 3D

Play on Lichess with a 3D board using Lichess' public API.

WORK IN PROGRESS ...

## Features

- Fully client side, no server needed
- Login with Lichess (OAuth2 PKCE)
- View ongoing games
- Play games
- Challenge the AI opponent
- Challenge a player
- Create a game seek
- Watch Lichess TV

## Use it

This app is available [here](https://yafred.github.io/lichess3D/)

## Run it on your machine

At the moment, it is a bit messy.
We bundle chessground with lichess3D.
So, you need lichess3D and chessground in the same parent folder.

1. Clone https://github.com/yafred/chessground (switch to branch chess3D)
2. `cd chessground`
3. `pnpm install`
4. `pnpm run compile`
5. `cd ..`
6. Clone https://github.com/yafred/lichess3D (switch to branch chess3D)
7. `cd lichess3D`
8. `pnpm install`
9. `pnpm run build`
10. `pnpm run serve`

## Work on both repos together

1. `cd lichess3D`
2. `pnpm run dev`

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
