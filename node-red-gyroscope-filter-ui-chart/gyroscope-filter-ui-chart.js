module.exports = function(RED) {
    function GyroscopeFilterUIChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Lấy giá trị maxPoints từ cấu hình của node hoặc sử dụng giá trị mặc định
        var maxPoints = config.maxPoints || 50;

        node.on('input', function(msg) {
            // Phân tích cú pháp msg.payload nếu nó là một chuỗi JSON
            let payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;

            // Lấy dữ liệu hiện tại từ ngữ cảnh flow
            let gyroData = node.context().flow.get('gyroData') || {
                Gyro_X: [],
                Gyro_Y: [],
                Gyro_Z: []
            };

            // Kiểm tra xem có cần reset dữ liệu không
            if (msg.reset === true) {
                gyroData = {
                    Gyro_X: [],
                    Gyro_Y: [],
                    Gyro_Z: []
                };
                node.context().flow.set('gyroData', gyroData); // Lưu trữ dữ liệu đã được reset
            } 
            else {
                // Đảm bảo payload và payload.gyros được định nghĩa và hợp lệ
                if (payload && Array.isArray(payload.gyros) && payload.gyros.length === 3) {
                    let gyros = payload.gyros;

                    // Thời gian hiện tại tính bằng milliseconds
                    let timestamp = new Date().getTime();

                    // Thêm các điểm dữ liệu mới
                    gyroData.Gyro_X.push({ "x": timestamp, "y": gyros[0] });
                    gyroData.Gyro_Y.push({ "x": timestamp, "y": gyros[1] });
                    gyroData.Gyro_Z.push({ "x": timestamp, "y": gyros[2] });

                    // Giới hạn số lượng điểm dữ liệu theo maxPoints
                    if (gyroData.Gyro_X.length > maxPoints) {
                        gyroData.Gyro_X.shift();
                        gyroData.Gyro_Y.shift();
                        gyroData.Gyro_Z.shift();
                    }
                } else {
                    node.warn("Dữ liệu gyroscope không hợp lệ hoặc bị thiếu trong msg.payload");
                }
            }

            // Lưu trữ dữ liệu đã cập nhật trở lại ngữ cảnh flow
            node.context().flow.set('gyroData', gyroData);

            // Chuẩn bị đối tượng kết quả
            let result = [
                {
                    "series": ["Gyro_X", "Gyro_Y", "Gyro_Z"],
                    "data": [
                        gyroData.Gyro_X,
                        gyroData.Gyro_Y,
                        gyroData.Gyro_Z
                    ],
                    "labels": [""]
                }
            ];

            // Xuất dữ liệu đã chuyển đổi cho node ui_chart
            msg.payload = result;
            node.send(msg);
        });
    }

    RED.nodes.registerType("gyroscope-filter-ui-chart", GyroscopeFilterUIChartNode, {
        // Định nghĩa các tham số cấu hình của node
        defaults: {
            name: { value: "" },
            maxPoints: { value: 50 }
        }
    });
}
