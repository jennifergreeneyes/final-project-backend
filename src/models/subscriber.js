module.exports = (connection, DataTypes) => {
  const schema = {
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    subscribe: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    messageSent: DataTypes.DATE,
  };
  const SubscriberModel = connection.define('Subscriber', schema);
  return SubscriberModel;
};
