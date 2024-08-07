module.exports = function(RED) {
    function CompatibleWithUITableNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.showDevice = config.showDevice;
        this.showSensorType = config.showSensorType;
        this.showDataType = config.showDataType;
        this.showTimestamp = config.showTimestamp;
        this.showValue = config.showValue;
        this.showX = config.showX;
        this.showY = config.showY;
        this.showZ = config.showZ;

        var node = this;

        // Hàm định dạng thời gian theo yêu cầu
        function formatTimestamp(date) {
            var ms = date.getMilliseconds().toString().padStart(3, '0');
            var ss = date.getSeconds().toString().padStart(2, '0');
            var mm = date.getMinutes().toString().padStart(2, '0');
            var hh = date.getHours().toString().padStart(2, '0');
            var day = date.getDate().toString().padStart(2, '0');
            var month = (date.getMonth() + 1).toString().padStart(2, '0');
            var year = date.getFullYear();

            return `${ms} - ${ss}/${mm}/${hh} - ${day}/${month}/${year}`;
        }

        node.on('input', function(msg) {
            var payload = msg.payload;
            
            // Lấy mảng dữ liệu từ context, nếu chưa có thì khởi tạo mảng rỗng
            var tableData = node.context().get('tableData') || [];

            // Tạo đối tượng để thêm vào bảng
            var dataEntry = {};

            if (node.showTimestamp) {
                dataEntry.timestamp = formatTimestamp(new Date()); // Định dạng thời gian hiện tại
            }
            if (node.showDevice) {
                dataEntry.device = payload.device || "N/A";
            }
            if (node.showSensorType) {
                dataEntry.sensorType = payload.sensorType || "N/A";
            }
            if (node.showDataType) {
                dataEntry.dataType = payload.dataType || "N/A";
            }
            if (node.showValue && (payload.dataType !== "accel" && payload.dataType !== "gyros")) {
                dataEntry.value = payload.data || "N/A";
            }
            if (node.showX || node.showY || node.showZ) {
                if (payload.dataType === "accel" || payload.dataType === "gyros") {
                    var sensorData = payload.data.map(value => value.toFixed(2)); // Làm tròn dữ liệu nếu cần
                    if (node.showX) dataEntry.x = sensorData[0] || "N/A";
                    if (node.showY) dataEntry.y = sensorData[1] || "N/A";
                    if (node.showZ) dataEntry.z = sensorData[2] || "N/A";
                }
            }

            // Thêm đối tượng vào mảng dữ liệu
            tableData.push(dataEntry);

            // Chỉ giữ lại 10 giá trị cuối cùng
            if (tableData.length > 10) {
                tableData = tableData.slice(-10); // Giữ lại 10 phần tử cuối cùng
            }

            // Lưu mảng dữ liệu vào context
            node.context().set('tableData', tableData);

            // Cập nhật msg.payload để chứa mảng dữ liệu cho ui_table
            msg.payload = tableData;

            // Gửi thông điệp với dữ liệu đã được định dạng
            node.send(msg);
        });
    }
    RED.nodes.registerType("compatible-with-ui-table", CompatibleWithUITableNode);
};
