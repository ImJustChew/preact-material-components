import {existsSync} from 'fs';
import * as npx from 'libnpx';
import {join, resolve} from 'path';
import {ls} from 'shelljs';

const rootDir = resolve(join(__dirname, '..'));
const pkgDir = join(rootDir, 'packages');

function project2path(proj: string, tsconfigName: string) {
  if (tsconfigName === 'tsconfig.json') {
    return resolve(join(pkgDir, proj));
  } else {
    return resolve(join(pkgDir, proj, tsconfigName));
  }
}

async function compile(tsconfigName: string) {
  const packages = ls(pkgDir);

  console.log(`Building with ${tsconfigName}`);

  const tsPackages = packages.filter(dir => {
    const tsconfigPath = join(pkgDir, dir, tsconfigName);
    return existsSync(tsconfigPath);
  });

  const args = ['--build'];
  if (process.argv.includes('--watch')) {
    args.push('--watch');
  }

  const tsProjects: string[] = tsPackages.map(proj =>
    project2path(proj, tsconfigName)
  );

  const res = await npx({
    cmdOpts: args.concat(tsProjects),
    command: 'tsc',
    npxPkg: join(__dirname, '..', 'package.json'),
    package: ['typescript']
  });
  const exit = res ? res.code : process.exitCode || 1;
  if (exit) {
    console.error('npx failed');
    process.exit(1);
  }
}

if (require.main === module) {
  // noinspection JSIgnoredPromiseFromCall
  compile(
    process.argv.length > 2
      ? `tsconfig.${process.argv[2]}.json`
      : 'tsconfig.json'
  );
}
