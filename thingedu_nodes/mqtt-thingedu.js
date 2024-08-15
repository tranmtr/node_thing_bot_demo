module.exports = function (RED) {
  const mqtt = require('mqtt');

  function mqtt_thingEdu(config) {
    RED.nodes.createNode(this, config);

    this.deviceId = config.deviceId;
    this.sensorType = config.sensorType;
    this.dataType = config.dataType;
    this.value = config.value;

    var defaultMQTTBrokerURL = '2cd0d770fc9e4de99263e34330dc866e.s1.eu.hivemq.cloud';
    var defaultOptions = {
      username: 'cobot2',
      password: 'Cobot@2024',
      protocol: 'mqtts',
      rejectUnauthorized: true
    };
    var mqttBrokerURL = `mqtt://${config.mqttBrokerURL || defaultMQTTBrokerURL}`;

    var client = mqtt.connect(mqttBrokerURL, defaultOptions);
    var topic = `thingbot/${this.deviceId}/${this.sensorType}`;

    client.on('connect', function () {
      this.status({fill:"green",shape:"dot",text:"connected"});
      client.subscribe(topic, function(error) {
        if (error) {
          this.status({fill:"red",shape:"ring",text:"subscription error"});
          this.error("Subscription error: " + error.message);
        };
      });
    });

    client.on('message', function (topic, message) {
      var msg = {topic: topic, payload: message.toString()};
      this.send(msg);
    });

    client.on('error', function (error) {
      this.status({fill:"red",shape:"ring",text:"connection error"});
      this.error("Connection error: " + error.message);
    });

    this.on('close', function() {
      client.end();
    });

  };

  RED.nodes.registerType("mqtt-thingedu", mqtt_thingEdu);
}
