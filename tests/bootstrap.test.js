import { spawn } from 'child_process';
import mongoose from 'mongoose';
import yenv from 'yenv';

const PORT = 3000;
let slsOfflineProcess;

// helper functions
function stopSlsOffline() {
  slsOfflineProcess.kill();
  console.log('Serverless Offline stopped'); // eslint-disable-line
}

function startSlsOffline(done) {
  slsOfflineProcess = spawn('sls', ['offline', 'start', '--port', PORT, '--stage', 'test']);
  console.log(`Serverless: Offline started with PID : ${slsOfflineProcess.pid}`); // eslint-disable-line

  slsOfflineProcess.stdout.on('data', (data) => {
    if (data.includes('Offline listening on')) {
      console.log(data.toString().trim()); // eslint-disable-line
      done();
    }
  });

  slsOfflineProcess.stderr.on('data', (errData) => {
    console.log(`Error starting Serverless Offline:\n${errData}`); // eslint-disable-line
    done(errData);
  });
}

function connectMongo(done) {
  const env = yenv('env.yml', { env: 'test' });

  if (mongoose.connection.readyState !== 1) {
    mongoose
      .connect(env.MONGO_URI, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
      })
      .then(() => {
        console.log('Connected to Mongo Database'); // eslint-disable-line
        done();
      })
      .catch((err) => {
        done(err);
      });
  } else {
    done();
  }
}

function disconnectMongo() {
  mongoose.disconnect();
  console.log('Disconnect from Mongo Database'); // eslint-disable-line
}

before((done) => {
  startSlsOffline((err) => {
    if (err) {
      return done(err);
    }

    connectMongo(done);
  });
});

after((done) => {
  stopSlsOffline();
  disconnectMongo();
  done();
});
