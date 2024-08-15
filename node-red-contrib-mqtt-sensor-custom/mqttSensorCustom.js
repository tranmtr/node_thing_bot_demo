module.exports = function(RED) {
    function MQTTSensorCustomNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var mqtt = require('mqtt');

        var brokerUrl = '2cd0d770fc9e4de99263e34330dc866e.s1.eu.hivemq.cloud'; // Địa chỉ broker cố định

        var options = {
            port: 8883, // Cổng kết nối mặc định là 8883 cho TLS
            username: 'cobot2',
            password: 'Cobot@2024',
            protocol: 'mqtts', // Giao thức, mặc định là 'mqtts' nếu dùng TLS
            rejectUnauthorized: true // Xác minh chứng chỉ của máy chủ, mặc định là true
        };

        var url = `mqtts://${brokerUrl}`;

        var client = mqtt.connect(url, options);

        // Xây dựng topic
        if(config.sensor === "Gyro_accelerometer")
        {
            var constructedTopic = `${config.device}/mpu`;
        }
        else if (config.sensor === "ProximitySensor")
        {
            var constructedTopic = `${config.device}/prox`;
        }

        client.on('connect', function () {
            node.status({fill:"green",shape:"dot",text:"connected"});
            client.subscribe(constructedTopic, { qos: 1 }, function (err) {
                if (err) {
                    node.status({fill:"red",shape:"ring",text:"subscription error"});
                    node.error("Subscription error: " + err.message);
                }
            });
        });

        client.on('message', function (topic, message) {
            try {
                var data = JSON.parse(message.toString());
                //node.warn("Received data: " + JSON.stringify(data)); // Ghi nhận dữ liệu nhận được
                //node.warn("Config: sensor=" + config.sensor + ", dataType=" + config.dataType + ", value=" + config.value); // Ghi nhận cấu hình hiện tại

                var msg = {
                    topic: topic,
                    payload: {}
                };

                // Kiểm tra và xử lý dữ liệu đầu vào
                if (data.device && data.sensorType) 
                {
                    msg.payload.timestamp = data.timestamp;
                    msg.payload.device = data.device; 
                    msg.payload.sensor = config.sensor;
                    msg.payload.dataType = config.dataType;
                    msg.payload.value = config.value;
                    
                    
                    // Xây dựng topic
                    //var constructedTopic = `${data.device}/${config.sensor}/${config.dataType}/${config.value}`;

                    // Kiểm tra loại cảm biến
                    if (config.sensor === "Gyro_accelerometer") 
                    {
                        if (config.dataType === "accel" && data.accel) 
                        {
                            if (config.value === "x") 
                            {
                                msg.payload.dataValue = data.accel[0]; // accel_x
                            } 
                            else if (config.value === "y") 
                            {
                                msg.payload.dataValue = data.accel[1]; // accel_y
                            } 
                            else if (config.value === "z") 
                            {
                                msg.payload.dataValue = data.accel[2]; // accel_z
                            } 
                            else 
                            {
                                msg.payload.dataValue = 0; 
                            }
                        } 
                        else if (config.dataType === "gyros" && data.gyros) 
                        {
                            if (config.value === "x") 
                            {
                                msg.payload.dataValue = data.gyros[0]; // gyros_x
                            } 
                            else if (config.value === "y") 
                            {
                                msg.payload.dataValue = data.gyros[1]; // gyros_y
                            } 
                            else if (config.value === "z") {
                                msg.payload.dataValue = data.gyros[2]; // gyros_z
                            } 
                            else 
                            {
                                msg.payload.dataValue = 0;
                            }
                        }
                    }
                    else if(config.sensor === "ProximitySensor")
                    {
                        if (config.dataType === "distance" && data.distance) 
                        {
                            if (config.value === "value") 
                            {
                                msg.payload.dataValue = data.distance[0]; // distance_value
                            } 
                            else 
                            {
                                msg.payload.dataValue = 0; 
                            }
                        } 
                    }
                    else 
                    {
                        node.warn(`Config sensor (${config.sensor}) does not match received sensorType (${data.sensorType})`);
                    }

                } 
                else 
                {
                    node.warn("Invalid data format: Missing required fields or unsupported data type");
                }
                // Cập nhật topic
                msg.topic = `${config.device}/${config.sensor}/${config.dataType}/${config.value}`;
                node.send(msg);

            } 
            catch (e) 
            {
                node.error("Failed to parse message: " + e.message);
            }
        });

        client.on('error', function (err) 
        {
            node.status({fill:"red",shape:"ring",text:"connection error"});
            node.error("Connection error: " + err.message);
        });

        node.on('close', function() 
        {
            client.end(); // Đóng kết nối khi node bị xóa
        });
    }

    RED.nodes.registerType("mqtt-sensor-custom", MQTTSensorCustomNode);
}
