const path = require('node:path');
const glob = require('fast-glob');
const ts = require('typescript');
const esbuild = require('esbuild');
const fs = require('node:fs');
const { generateDtsBundle } = require('dts-bundle-generator');
const _ = async () => {

    const sourcePath = path.resolve(__dirname, "../", "src")

    const entryPoints = glob.sync(path.resolve(sourcePath, "**", "**.ts").replace(/\\/g, '/'));

    const outdir = path.join(__dirname, "../", 'build');

    if (!fs.existsSync(outdir)) {
        fs.mkdirSync(outdir);
    }

    console.log("Generating .cjs files");

    esbuild.build({
        entryPoints: ['./src/index.ts'],
        outfile: outdir + '/aleksray.cjs',
        format: "cjs",
        sourcemap: "external",
        platform: "node",
        outExtension: { '.js': '.cjs', },
        bundle: true,
        external: ['@permafrost-dev/pretty-format', 'p-queue', 'stacktrace-js']
    });

    esbuild.build({
        entryPoints: ['./src/index.ts'],
        outfile: outdir + '/standalone-aleksray-bundle.cjs',
        format: "cjs",
        sourcemap: "external",
        platform: "node",
        outExtension: { '.js': '.cjs', },
        bundle: true,
        // external: ['@permafrost-dev/pretty-format', 'p-queue', 'stacktrace-js']
    });


    console.log("Generating .mjs files");

    esbuild.build({
        entryPoints: ['./src/index.ts'],

        outfile: outdir + '/aleksray.mjs',
        format: "esm",
        sourcemap: "external",
        platform: "node",
        outExtension: { '.js': '.mjs', },
        bundle: true,
        external: ['@permafrost-dev/pretty-format', 'p-queue', 'stacktrace-js']
    });

    esbuild.build({
        entryPoints: ['./src/index.ts'],

        outfile: outdir + '/standalone-aleksray-bundle.mjs',
        format: "esm",
        sourcemap: "external",
        platform: "node",
        outExtension: { '.js': '.mjs', },
        bundle: true,
        // external: ['@permafrost-dev/pretty-format', 'p-queue', 'stacktrace-js']
    });


    console.log("Generating .d.ts files");
    const dts = generateDtsBundle([{ filePath: sourcePath + '/index.ts' }])
        .pop()
        .replaceAll('export {};', '')
        .replaceAll(/\n{2,}/g, '\n')
        .replaceAll(/\t/g, '    ')
        .trim();


    fs.writeFileSync(outdir + '/aleksray.d.ts', dts, 'utf8');



}


_();