# The app

Play on Lichess on a 3D board using Lichess public API.

WORK IN PROGRESS ...

## Use it

This app is available [here](https://yafred.github.io/api-demo/)

## Run it on your machine

At the moment, it is a bit messy.
We bundle chessground with api-demo.
So, you need api-demo and chessground in the same parent folder.

1. Clone https://github.com/yafred/chessground (switch to branch chess3D)
2. `cd chessground`
3. `pnpm install`
4. `pnpm run compile`
5. `cd ..`
6. Clone https://github.com/yafred/api-demo (switch to branch chess3D)
7. `cd api-demo`
8. `pnpm install`
9. `pnpm run build`
10. `pnpm run serve`

## Work on both repos together

1. `cd api-demo`
2. `pnpm run dev`

This starts three processes:

- a TypeScript watch build in `../chessground`
- the Rollup watch build for this app
- `http-server` with caching disabled


