module.exports = function(RED) {
    function SampleNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Sử dụng các thông số cấu hình từ config
        node.name = config.name;
        node.key1 = config.key1;
        node.key2 = config.key2;

        // Xử lý khi nhận được một message
        node.on('input', function(msg) {
            // Thực hiện các thao tác với msg.payload
            msg.payload = "Received payload: " + msg.payload;
            // Gửi message đến node tiếp theo
            node.send(msg);
        });
    }
    RED.nodes.registerType("sample", SampleNode);
}
