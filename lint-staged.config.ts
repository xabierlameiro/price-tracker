const config: Record<string, string[]> = {
  "*.{ts,tsx}": ["eslint --fix --max-warnings=0"],
  "*.{ts,tsx,css,md,json,yaml,yml}": ["prettier --write --ignore-unknown"],
};

export default config;
