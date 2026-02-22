
// Git commit hash is injected at build time by vite-plugin-git-version
declare const __GIT_COMMIT_HASH__: string;

const commitHash = typeof __GIT_COMMIT_HASH__ !== 'undefined' ? __GIT_COMMIT_HASH__ : 'dev';

export const GAME_VERSION = `Ver. 0.1.${commitHash}α`;
