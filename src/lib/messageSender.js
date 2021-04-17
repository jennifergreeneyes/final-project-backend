const twilio = require('twilio');
const config = require('../../config');
const client = twilio(config.accountSid, config.authToken);
const { Subscriber } = require("../models");

const sendSingleTwilioMessage = (subscriber, message) => {
  const options = {
    to: subscriber.phone,
    from: config.twilioNumber,
    body: message,
  };
  return new Promise((resolve, reject) => {
    client.messages
      .create(options)
      .then((message) => {
        console.log(message);
        resolve(message);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const sendMessageToSubscribers = (subscribers, message) => {
  return new Promise((resolve, reject) => {
    if (subscribers.length == 0) {
      reject({ message: 'Could not find any subscribers!' });
    } else {
      subscribers
        .map((subscriber) => {
          let currentTime = new Date();
          Subscriber.update(
            { messageSent: currentTime },
            { where: { id: subscriber.id } }
          );
          return sendSingleTwilioMessage(subscriber, message);
        })
        .reduce((all, currentPromise) => {
          return Promise.all([all, currentPromise]);
        }, Promise.resolve())
        .then(() => {
          resolve();
        });
    }
  });
};

module.exports.sendMessageToSubscribers = sendMessageToSubscribers;
