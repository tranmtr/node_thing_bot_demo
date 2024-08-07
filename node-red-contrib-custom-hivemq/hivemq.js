module.exports = function(RED) {
    function HiveMQNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const mqtt = require('mqtt');

        // Lấy thông tin cấu hình từ node
        const brokerUrl = config.brokerUrl;
        const topic = config.topic;
        const clientId = config.clientId;
        const username = config.username;
        const password = config.password;
        const ca = config.ca;
        const verifyServerCert = config.verifyservercert;

        // Cấu hình kết nối MQTT
        const options = {
            clientId: clientId,
            username: username,
            password: password,
            ca: ca ? [Buffer.from(ca, 'base64')] : undefined, // Chuyển đổi CA từ base64 nếu có
            rejectUnauthorized: verifyServerCert
        };

        // Kết nối tới broker MQTT
        const client = mqtt.connect(brokerUrl, options);

        // Sự kiện khi kết nối thành công
        client.on('connect', function() {
            node.log('Connected to MQTT broker');
            client.subscribe(topic, function(err) {
                if (err) {
                    node.error('Subscription error: ' + err);
                } else {
                    node.log('Subscribed to topic: ' + topic);
                }
            });
        });

        // Sự kiện khi nhận được tin nhắn
        client.on('message', function(topic, message) {
            node.send({ payload: message.toString() });
        });

        // Sự kiện khi node bị đóng
        node.on('close', function() {
            client.end();
        });
    }

    // Đăng ký loại node mới với Node-RED
    RED.nodes.registerType("hivemq", HiveMQNode);
}
