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
      
      // 浼樺厛浣跨敤鐜鍙橀噺锛圖ocker 鏋勫缓鏃朵紶鍏ワ級
      if (process.env.GIT_COMMIT_HASH) {
        commitHash = process.env.GIT_COMMIT_HASH;
        console.log(`[Git Version] Using commit hash from env: ${commitHash}`);
      } else {
        // 灏濊瘯浠?Git 鑾峰彇
        try {
          commitHash = execSync('git rev-parse --short=7 HEAD')
            .toString()
            .trim();
          console.log(`[Git Version] Using commit hash from git: ${commitHash}`);
        } catch (error) {
          console.warn('[Git Version] Failed to get commit hash, using "unknown"');
          console.warn('[Git Version] This is normal in Docker builds without .git directory');
        }
      }

      return {
        define: {
          '__GIT_COMMIT_HASH__': JSON.stringify(commitHash),
        },
      };
    },
  };
}

