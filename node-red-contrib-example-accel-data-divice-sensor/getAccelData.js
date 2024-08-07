module.exports = function(RED) {
    function GetAccelNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Đặt cấu hình của node từ các thuộc tính của đối tượng config
        this.name = config.name;
        this.device = config.device;
        this.sensorType = config.sensorType;

        node.on('input', function(msg) {
            var payload = msg.payload;

            var userDevice = node.device || ""; // Lấy từ cấu hình của node
            var userSensorType = node.sensorType || ""; // Lấy từ cấu hình của node

            if (payload && payload.accel && typeof payload.accel === 'object') {
                if (userDevice && userSensorType) {
                    if (payload.device === userDevice && payload.sensorType === userSensorType) {
                        msg.payload = {
                            accel: payload.accel
                        };
                    } else {
                        msg.payload = {
                            error: "No data found for the specified device and sensor type."
                        };
                    }
                } else {
                    msg.payload = {
                        accel: payload.accel
                    };
                }
            } else {
                msg.payload = {
                    error: "Accel data is missing or not in expected format."
                };
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("get-accel", GetAccelNode);
};
