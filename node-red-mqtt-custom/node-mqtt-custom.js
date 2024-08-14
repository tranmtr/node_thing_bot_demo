module.exports = function(RED) {
    function MQTTCustomNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var mqtt = require('mqtt');

        var brokerUrl = '2cd0d770fc9e4de99263e34330dc866e.s1.eu.hivemq.cloud'; // Địa chỉ broker cố định

        // Tạo tùy chọn kết nối MQTT với giá trị mặc định
        var options = {
            port: 8883, // Cổng kết nối mặc định là 8883 cho TLS
            username: 'cobot2',
            password: 'Cobot@2024',
            protocol: 'mqtts', // Giao thức, mặc định là 'mqtts' nếu dùng TLS
            rejectUnauthorized: true // Xác minh chứng chỉ của máy chủ, mặc định là true
        };

        // Tạo URL kết nối với broker cố định
        var url = `mqtts://${brokerUrl}`;
        node.log(`Connecting to MQTT broker at ${url}`); // Log URL để kiểm tra

        var client = mqtt.connect(url, options);

        client.on('connect', function () {
            node.status({fill:"green",shape:"dot",text:"connected"});
            client.subscribe('#', { qos: 1 }, function (err) {
                if (err) {
                    node.status({fill:"red",shape:"ring",text:"subscription error"});
                    node.error("Subscription error: " + err.message);
                }
            });
        });

        client.on('message', function (topic, message) {
            // Giả sử dữ liệu JSON đã được gửi dưới dạng chuỗi
            try {
                var parsedMessage = JSON.parse(message.toString());

                // Tạo đối tượng JSON với cấu trúc cần thiết
                var output = {
                    device: parsedMessage.device,
                    sensorType: parsedMessage.sensorType,
                    accel: parsedMessage.accel,
                    gyros: parsedMessage.gyros
                };

                // Tạo đối tượng msg để gửi ra
                var msg = {
                    topic: topic,
                    payload: output // Đưa dữ liệu JSON vào payload
                };

                node.send(msg);
            } catch (e) {
                node.error("Message parse error: " + e.message);
            }
        });

        client.on('error', function (err) {
            node.status({fill:"red",shape:"ring",text:"connection error"});
            node.error("Connection error: " + err.message);
        });

        node.on('close', function() {
            client.end(); // Đóng kết nối khi node bị xóa
        });
    }

    RED.nodes.registerType("mqtt-custom", MQTTCustomNode);
}
