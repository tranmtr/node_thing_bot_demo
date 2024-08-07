module.exports = function(RED) {
    function GyrosDataNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Lấy giá trị maxPoints từ cấu hình của node hoặc sử dụng giá trị mặc định
        var maxPoints = config.maxPoints || 10;

        node.on('input', function(msg) {
            // Lấy dữ liệu hiện tại từ ngữ cảnh flow
            let gyrosData = node.context().flow.get('gyrosData') || {
                Gyros_X: [],
                Gyros_Y: [],
                Gyros_Z: []
            };

            // Kiểm tra xem có cần reset dữ liệu không
            if (msg.reset === true) {
                gyrosData = {
                    Gyros_X: [],
                    Gyros_Y: [],
                    Gyros_Z: []
                };
                node.context().flow.set('gyrosData', gyrosData); // Lưu trữ dữ liệu đã được reset
            } 
            else {
                // Đảm bảo msg.payload và msg.payload.gyros được định nghĩa và hợp lệ
                if (msg.payload && Array.isArray(msg.payload.data) && msg.payload.data.length === 3) {
                    let gyros = msg.payload.data;

                    // Thời gian hiện tại tính bằng milliseconds
                    let timestamp = new Date().getTime();

                    // Thêm các điểm dữ liệu mới
                    gyrosData.Gyros_X.push({ "x": timestamp, "y": gyros[0] });
                    gyrosData.Gyros_Y.push({ "x": timestamp, "y": gyros[1] });
                    gyrosData.Gyros_Z.push({ "x": timestamp, "y": gyros[2] });

                    // Giới hạn số lượng điểm dữ liệu theo maxPoints
                    if (gyrosData.Gyros_X.length > maxPoints) {
                        gyrosData.Gyros_X.shift();
                        gyrosData.Gyros_Y.shift();
                        gyrosData.Gyros_Z.shift();
                    }
                } else {
                    node.warn("Dữ liệu gyros không hợp lệ hoặc bị thiếu trong msg.payload");
                }
            }

            // Lưu trữ dữ liệu đã cập nhật trở lại ngữ cảnh flow
            node.context().flow.set('gyrosData', gyrosData);

            // Chuẩn bị đối tượng kết quả
            let result = [
                {
                    "series": ["Gyros_X", "Gyros_Y", "Gyros_Z"],
                    "data": [
                        gyrosData.Gyros_X,
                        gyrosData.Gyros_Y,
                        gyrosData.Gyros_Z
                    ],
                    "labels": [""]
                }
            ];

            // Xuất dữ liệu đã chuyển đổi cho node ui_chart
            msg.payload = result;
            node.send(msg);
        });
    }

    RED.nodes.registerType("gyros-MPU6050", GyrosDataNode, {
        // Định nghĩa các tham số cấu hình của node
        defaults: {
            name: { value: "" },
            maxPoints: { value: 10 }
        }
    });
}
