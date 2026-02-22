import { execSync } from 'child_process';
import type { Plugin } from 'vite';

/**
 * Vite plugin to inject Git commit hash into the build
 */
export function gitVersionPlugin(): Plugin {
  return {
    name: 'vite-plugin-git-version',
    config() {
      let commitHash = 'unknown';
      
      try {
        // Get the short commit hash (7 characters)
        commitHash = execSync('git rev-parse --short=7 HEAD')
          .toString()
          .trim();
      } catch (error) {
        console.warn('[Git Version] Failed to get commit hash:', error);
      }

      return {
        define: {
          '__GIT_COMMIT_HASH__': JSON.stringify(commitHash),
        },
      };
    },
  };
}
</contents>