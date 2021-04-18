const axios = require("axios");
const { Subscriber } = require("../models");
const messageSender = require("../lib/messageSender");

let timePreviousMessageSent;
let timeElapsedSincePreviousMessage;

const getDifferenceInHours = (date2, date1) => {
  let diff = (date2.getTime() - date1.getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

const energyMessage = () => {
  const currentHour = new Date().getHours();
  console.log(`Current hour: ${currentHour}`);

  if (currentHour >= 7 && currentHour <= 20) {
    axios.get("https://api.reactive.energy/energy-mix").then((res) => {
      const energyMix = res.data;
      const currentGreenEnergyProportion =
        energyMix.wind.proportion +
        energyMix.solar.proportion +
        energyMix.biomass.proportion +
        energyMix.hydro.proportion +
        energyMix.nuclear.proportion;

      if (currentGreenEnergyProportion > 0.3) {
        const currentTime = new Date();
        Subscriber.findAll({
          where: {
            subscribe: true,
          },
        }).then((subscribers) => {
          timePreviousMessageSent = subscribers[0].messageSent;

          console.log(`Previous message sent at: ${timePreviousMessageSent}`);

          if (timePreviousMessageSent !== null) {
            timeElapsedSincePreviousMessage = getDifferenceInHours(
              currentTime,
              timePreviousMessageSent
            );
          }

          console.log(
            `Time elapsed since previous message: ${timeElapsedSincePreviousMessage}`
          );

          if (
            timePreviousMessageSent === null ||
            timeElapsedSincePreviousMessage > 10
          ) {
            Subscriber.findAll({
              where: {
                subscribe: true,
              },
            })
              .then((subscribers) => {
                messageSender.sendMessageToSubscribers(
                  subscribers,
                  `From test app: Current low carbon energy proportion is ${Math.floor(
                    currentGreenEnergyProportion * 100
                  )}%. You are an eco-champion!`
                );
              })
              .then(() => {
                res
                  .status(200)
                  .send("Success! Your message(s) have been sent.");
              })
              .catch((err) => {
                console.log(`Err ${err.message}`);
                res.status(500).send(err.message);
              });
          } else {
            return console.log(
              "Status: It has not been 10 hours since the previous message. No message sent."
            );
          }
        });
      } else {
        return console.log(
          `Status: Current low carbon energy proportion is only ${Math.floor(
            currentGreenEnergyProportion * 100
          )}%. No message sent.`
        );
      }
    });
  } else {
    return console.log(
      "Status: Do not disturb is active. Only send messages between 08:00 and 21:00. No messages sent."
    );
  }
};

module.exports = energyMessage;
