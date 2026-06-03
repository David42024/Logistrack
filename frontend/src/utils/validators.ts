export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidWeight = (w: number) => w > 0 && w < 100000;

export const isRequired = (val: string) => val.trim().length > 0;
