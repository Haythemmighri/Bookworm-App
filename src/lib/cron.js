import cron from 'cron'
import https from 'https'

const job = new cron.CronJob('*/14 * * * *', () => {
    https
    .get(process.env.API_URL, (res) => {
        if (res.statusCode === 200) console.log('Get request run successfully');
        else console.log('Get request failed', res.statusCode);
    })
    .on("error", (e) => {
        console.error('Error while sending request:', e);
    })
});

export default job;

// To start the cron job, uncomment the following line:
// job.start();
