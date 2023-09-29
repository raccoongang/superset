const fs = require('fs'),
  sharp = require('sharp'),
  path = require('path'),
  { exec, spawn } = require('child_process'),
  logger = require('./logger')(module);

const execChildAsync = async function (command) {
    return new Promise(function (resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
};

const getAllFiles = async function (dirPath, arrayOfFiles) {
    const files = await fs.promises.readdir(dirPath);
    let stat;
    arrayOfFiles = arrayOfFiles || [];
    for (const file of files) {
        stat = await fs.promises.stat(dirPath + '/' + file);
        if (stat.isDirectory()) {
            arrayOfFiles = await getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    }

    return arrayOfFiles;
};

const spawnChildAsync = async function (command, options) {
    const child = spawn(command, options);

    let data = '',
      error = '';
    for await (const chunk of child.stdout) {
        data += chunk;
    }
    for await (const chunk of child.stderr) {
        error += chunk;
    }
    child.on('error', function (err) {
        logger.error(
          `Subprocess execution error for the command [${command}]`,
          err,
        );
    });

    const exitCode = await new Promise((resolve, reject) => {
        child.on('close', resolve);
    });

    if (exitCode) {
        throw new Error(`subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
};

const cleanDirs = async function (...dirs) {
    for (let dir of dirs) {
        if (!dir) continue;
        await fs.promises.access(dir, fs.constants.R_OK | fs.constants.W_OK);
        await fs.promises.rm(dir, { recursive: true, force: true });
    }
};

const ensureDir = async function (filePath) {
    const dirPath = path.dirname(filePath);
    try {
        await fs.promises.access(dirPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
};

const convertHtmlToPng = async function (html) {
    const svgBuffer = Buffer.from(html);
    const image = await sharp(svgBuffer).toFormat('png').toBuffer();

    return `data:image/png;base64,${image.toString('base64')}`;
};

module.exports = {
    cleanDirs: cleanDirs,
    convertHtmlToPng: convertHtmlToPng,
    getAllFiles: getAllFiles,
    execChildAsync: execChildAsync,
    ensureDir: ensureDir,
    spawnChildAsync: spawnChildAsync,
};
