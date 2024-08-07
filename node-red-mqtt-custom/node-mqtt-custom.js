module.exports = function(RED) {
    function MQTTCustomNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var mqtt = require('mqtt');

        // Địa chỉ broker cố định
        var brokerUrl = '2cd0d770fc9e4de99263e34330dc866e.s1.eu.hivemq.cloud'; // Địa chỉ broker của bạn

        // Tạo tùy chọn kết nối MQTT
        var options = {
            port: parseInt(config.port) || 8883, // Cổng kết nối, mặc định là 8883 cho TLS
            username: config.username || null, // Tên đăng nhập, nếu có
            password: config.password || null, // Mật khẩu, nếu có
            protocol: config.usetls ? 'mqtts' : 'mqtt', // Giao thức, mặc định là 'mqtts' nếu dùng TLS
            rejectUnauthorized: config.verifyServerCert || false // Xác minh chứng chỉ của máy chủ
        };

        // Tạo URL kết nối với broker cố định
        var url = `mqtt${config.usetls ? 's' : ''}://${brokerUrl}`;
        node.log(`Connecting to MQTT broker at ${url}`); // Log URL để kiểm tra

        var client = mqtt.connect(url, options);

        client.on('connect', function () {
            node.status({fill:"green",shape:"dot",text:"connected"});
            client.subscribe(config.topic, { qos: parseInt(config.qos) || 1 }, function (err) {
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
            node.send(msg);
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
