export const read = (name: string) =>
  Deno.readTextFile(import.meta.url.slice(7).replace(/read\.ts/, name));
