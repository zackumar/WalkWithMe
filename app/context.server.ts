import type { AppLoadContext } from '@remix-run/cloudflare';
var context: AppLoadContext = {};

export const setContext = (newContext: AppLoadContext) => {
  context = newContext;
};

export const getContext = () => context;
