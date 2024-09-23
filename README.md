# MPC Framework Browser Demo

This is a demonstration of [MPC Framework](https://www.npmjs.com/package/mpc-framework) with the [`MpzSemiHonestBackend`](https://www.npmjs.com/package/mpz-ts) running in the browser.

It's a very not-flashy demo that simply outputs a few things to the console.

```sh
npm install
npm run dev
```

## Server Headers

If you want to deploy something like this, I suggest taking a look at [cross-origin isolation](https://web.dev/articles/cross-origin-isolation-guide). This is required for the use of `SharedArrayBuffer`, which is used to do multithreading for the underlying [mpz](https://github.com/privacy-scaling-explorations/mpz) library.

In this demo, the required headers are set in [`vite.config.ts`](./vite.config.ts).
