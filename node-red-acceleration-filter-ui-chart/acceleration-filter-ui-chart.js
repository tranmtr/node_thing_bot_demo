module.exports = function(RED) {
    function AccelerationFilterUIChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Lấy giá trị maxPoints từ cấu hình của node hoặc sử dụng giá trị mặc định
        var maxPoints = config.maxPoints || 50;

        node.on('input', function(msg) {
            // Phân tích cú pháp msg.payload nếu nó là một chuỗi JSON
            let payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;

            // Lấy dữ liệu hiện tại từ ngữ cảnh flow
            let accelData = node.context().flow.get('accelData') || {
                Accel_X: [],
                Accel_Y: [],
                Accel_Z: []
            };

            // Kiểm tra xem có cần reset dữ liệu không
            if (msg.reset === true) {
                accelData = {
                    Accel_X: [],
                    Accel_Y: [],
                    Accel_Z: []
                };
                node.context().flow.set('accelData', accelData); // Lưu trữ dữ liệu đã được reset
            } 
            else {
                // Đảm bảo payload và payload.accel được định nghĩa và hợp lệ
                if (payload && Array.isArray(payload.accel) && payload.accel.length === 3) {
                    let accel = payload.accel;

                    // Thời gian hiện tại tính bằng milliseconds
                    let timestamp = new Date().getTime();

                    // Thêm các điểm dữ liệu mới
                    accelData.Accel_X.push({ "x": timestamp, "y": accel[0] });
                    accelData.Accel_Y.push({ "x": timestamp, "y": accel[1] });
                    accelData.Accel_Z.push({ "x": timestamp, "y": accel[2] });

                    // Giới hạn số lượng điểm dữ liệu theo maxPoints
                    if (accelData.Accel_X.length > maxPoints) {
                        accelData.Accel_X.shift();
                        accelData.Accel_Y.shift();
                        accelData.Accel_Z.shift();
                    }
                } else {
                    node.warn("Dữ liệu accel không hợp lệ hoặc bị thiếu trong msg.payload");
                }
            }

            // Lưu trữ dữ liệu đã cập nhật trở lại ngữ cảnh flow
            node.context().flow.set('accelData', accelData);

            // Chuẩn bị đối tượng kết quả
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

            // Xuất dữ liệu đã chuyển đổi cho node ui_chart
            msg.payload = result;
            node.send(msg);
        });
    }

    RED.nodes.registerType("acceleration-filter-ui-chart", AccelerationFilterUIChartNode, {
        // Định nghĩa các tham số cấu hình của node
        defaults: {
            name: { value: "" },
            maxPoints: { value: 50 }
        }
    });
}
