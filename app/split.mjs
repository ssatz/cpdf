import { execSync } from 'child_process';
import * as fs from 'fs'
import { download, pusher, upload, streamToString } from './utility.mjs'
import archiver from 'archiver'

export const split = async (filename, uuid, range, isFile = false, userId = 'guest') => {
    try {
        // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
        const data = await download(filename);
        let cmd;
        // Convert the ReadableStream to a string.
        const bodyContents = await streamToString(data.Body);
        fs.writeFileSync(`/tmp/${filename}`, bodyContents);
        const outputFilename = `${uuid}.pdf`;
        console.log(outputFilename);
        if (isFile) {
            if (!fs.existsSync(`/tmp/${uuid}`)) {
                fs.mkdirSync(`/tmp/${uuid}`);
            }
            cmd = `cpdf  /tmp/${filename} ${range} AND -split -o /tmp/${uuid}/${uuid}_%%.pdf`;
            console.log(cmd);
            execSync(cmd, { stdio: 'inherit' });
            if (fs.existsSync(`/tmp/${uuid}`)) {
                let zipArchive = archiver('zip', {});
                const stream = fs.createWriteStream(`/tmp/${uuid}.zip`);
                zipArchive.pipe(stream)
                zipArchive.directory(`/tmp/${uuid}`, false);
                await zipArchive.finalize(function (err, bytes) {
                    if (err)
                        throw err;

                    console.log('done:', base, bytes);
                });
                const zipfileStream = fs.createReadStream(`/tmp/${uuid}.zip`);
                await upload(`${uuid}.zip`, userId, zipfileStream);
                fs.rmSync(`/tmp/${filename}`);
                fs.rmSync(`/tmp/${uuid}`, { recursive: true, force: true });
                fs.rmSync(`/tmp/${uuid}.zip`);

            }
        } else {
            cmd = `cpdf  /tmp/${filename} ${range} -o /tmp/${outputFilename} `;
            console.log(cmd);
            execSync(cmd, { stdio: 'inherit' });
            if (fs.existsSync(`/tmp/${outputFilename}`)) {
                const fileStream = fs.createReadStream(`/tmp/${outputFilename}`);
                await upload(outputFilename, userId, fileStream);
                fs.rmSync(`/tmp/${filename}`);
                fs.rmSync(`/tmp/${outputFilename}`);

            }
        }
        pusher.trigger(process.env.PUSHER_CHANNEL, process.env.PUSHER_EVENT, JSON.stringify({
            uuid: uuid,
            failed: false
        })).catch((e) => {
            console.log(e);
        });
    } catch (e) {
        pusher.trigger(process.env.PUSHER_CHANNEL, process.env.PUSHER_EVENT, JSON.stringify({
            uuid: uuid,
            failed: true
        })).catch((e) => {
            console.log(e);
        });
    }


};