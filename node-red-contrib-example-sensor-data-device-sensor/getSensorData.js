module.exports = function(RED) {
    function GetSensorNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Đặt cấu hình của node từ các thuộc tính của đối tượng config
        this.name = config.name;
        this.device = config.device;
        this.sensor = config.sensor;
        this.dataType = config.dataType;

        node.on('input', function(msg) {
            var payload = msg.payload;

            var userDevice = node.device || ""; // Lấy từ cấu hình của node
            var userSensor = node.sensor || ""; // Lấy từ cấu hình của node
            var userDataType = node.dataType || ""; // Lấy từ cấu hình của node

            // Ghi log dữ liệu đầu vào và cấu hình
            console.log("Payload:", payload);
            console.log("Requested Data Type:", userDataType);

            if (payload && typeof payload === 'object') {
                if (userDevice && userSensor && userDataType) {
                    if (payload.device === userDevice) {
                        // Tìm cảm biến phù hợp trong mảng sensorData
                        var sensorData = payload.sensorData.find(sensor => sensor.sensorType === userSensor);
                        if (sensorData) {
                            // Kiểm tra tồn tại của dataType trong sensorData
                            if (sensorData.hasOwnProperty(userDataType)) {
                                msg.payload = {
                                    device: userDevice,
                                    sensorType: userSensor,
                                    dataType: userDataType,
                                    data: sensorData[userDataType]
                                };
                            } else {
                                msg.payload = {
                                    error: `Data type "${userDataType}" not found in the payload. Available types: ${Object.keys(sensorData).join(', ')}`,
                                    device: userDevice,
                                    sensorType: userSensor,
                                    requestedDataType: userDataType
                                };
                            }
                        } else {
                            msg.payload = {
                                error: `Sensor type "${userSensor}" not found in the payload.`,
                                device: userDevice
                            };
                        }
                    } else {
                        msg.payload = {
                            error: "No data found for the specified device.",
                            device: userDevice
                        };
                    }
                } else {
                    msg.payload = {
                        error: "Device, sensor, or data type is missing or not specified."
                    };
                }
            } else {
                msg.payload = {
                    error: "Payload is missing or not in expected format."
                };
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("get-sensor", GetSensorNode);
};
