module.exports = function(RED) {
    function TemperatureFilterUIChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Lấy giá trị maxPoints từ cấu hình của node hoặc sử dụng giá trị mặc định
        var maxPoints = config.maxPoints || 50;

        node.on('input', function(msg) {
            // Phân tích cú pháp msg.payload nếu nó là một chuỗi JSON
            let payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;

            // Lấy dữ liệu hiện tại từ ngữ cảnh flow
            let tempData = node.context().flow.get('tempData') || {
                Temperature: []
            };

            // Kiểm tra xem có cần reset dữ liệu không
            if (msg.reset === true) {
                tempData = {
                    Temperature: []
                };
                node.context().flow.set('tempData', tempData); // Lưu trữ dữ liệu đã được reset
            } 
            else {
                // Đảm bảo payload và payload.temperature được định nghĩa và hợp lệ
                if (payload && payload.temperature !== undefined) {
                    let temperature = payload.temperature;

                    // Thời gian hiện tại tính bằng milliseconds
                    let timestamp = new Date().getTime();

                    // Thêm các điểm dữ liệu mới
                    tempData.Temperature.push({ "x": timestamp, "y": temperature });

                    // Giới hạn số lượng điểm dữ liệu theo maxPoints
                    if (tempData.Temperature.length > maxPoints) {
                        tempData.Temperature.shift();
                    }
                } else {
                    node.warn("Dữ liệu temperature không hợp lệ hoặc bị thiếu trong msg.payload");
                }
            }

            // Lưu trữ dữ liệu đã cập nhật trở lại ngữ cảnh flow
            node.context().flow.set('tempData', tempData);

            // Chuẩn bị đối tượng kết quả
            let result = [
                {
                    "series": ["Temperature"],
                    "data": [tempData.Temperature],
                    "labels": [""]
                }
            ];

            // Xuất dữ liệu đã chuyển đổi cho node ui_chart
            msg.payload = result;
            node.send(msg);
        });
    }

    RED.nodes.registerType("temperature-filter-ui-chart", TemperatureFilterUIChartNode, {
        // Định nghĩa các tham số cấu hình của node
        defaults: {
            name: { value: "" },
            maxPoints: { value: 50 }
        }
    });
}
