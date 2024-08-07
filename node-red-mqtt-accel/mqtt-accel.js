module.exports = function(RED) {
    function MQTTAccelNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var mqtt = require('mqtt');

        var brokerUrl = '2cd0d770fc9e4de99263e34330dc866e.s1.eu.hivemq.cloud';
        
        var options = {
            port: 8883,
            username: 'cobot2',
            password: 'Cobot@2024',
            protocol: 'mqtts',
            rejectUnauthorized: true
        };

        var url = `mqtts://${brokerUrl}`;
        node.log(`Connecting to MQTT broker at ${url}`);

        var client = mqtt.connect(url, options);

        client.on('connect', function () {
            node.status({fill:"green",shape:"dot",text:"connected"});
            client.subscribe(config.topic || '#', { qos: parseInt(config.qos) || 1 }, function (err) {
                if (err) {
                    node.status({fill:"red",shape:"ring",text:"subscription error"});
                    node.error("Subscription error: " + err.message);
                }
            });
        });

        client.on('message', function (topic, message) {
            var msg = {
                topic: topic,
                payload: message.toString()
            };

            try {
                let payload = JSON.parse(msg.payload);

                let accelData = node.context().flow.get('accelData') || {
                    Accel_X: [],
                    Accel_Y: [],
                    Accel_Z: []
                };

                if (payload && Array.isArray(payload.accel) && payload.accel.length === 3) {
                    let accel = payload.accel;

                    let timestamp = new Date().getTime();

                    accelData.Accel_X.push({ "x": timestamp, "y": accel[0] });
                    accelData.Accel_Y.push({ "x": timestamp, "y": accel[1] });
                    accelData.Accel_Z.push({ "x": timestamp, "y": accel[2] });

                    if (accelData.Accel_X.length > config.maxPoints) {
                        accelData.Accel_X.shift();
                        accelData.Accel_Y.shift();
                        accelData.Accel_Z.shift();
                    }
                } else {
                    node.warn("Invalid accel data or missing in msg.payload");
                }

                node.context().flow.set('accelData', accelData);

                let result = [
                    {
                        "series": ["Accel_X", "Accel_Y", "Accel_Z"],
                        "data": [
                            accelData.Accel_X,
                            accelData.Accel_Y,
                            accelData.Accel_Z
                        ],
                        "labels": [""]
                    }
                ];

                msg.payload = result;
                node.send(msg);
            } catch (err) {
                node.error("Error parsing JSON: " + err.message);
            }
        });

        client.on('error', function (err) {
            node.status({fill:"red",shape:"ring",text:"connection error"});
            node.error("Connection error: " + err.message);
        });

        node.on('close', function() {
            client.end();
        });
    }

    RED.nodes.registerType("mqtt-accel", MQTTAccelNode, {
        defaults: {
            name: { value: "" },
            topic: { value: "#" },
            qos: { value: "1" },
            maxPoints: { value: 10 },
            port: { value: "8883" },
            username: { value: "" },
            password: { value: "" },
            verifyServerCert: { value: true },
            usetls: { value: true }
        }
    });
}
