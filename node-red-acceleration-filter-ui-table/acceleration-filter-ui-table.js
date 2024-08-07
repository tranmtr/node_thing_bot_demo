module.exports = function(RED) {
    function AccelDataNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name || ""; // Nếu không có name thì gán giá trị rỗng
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
            // Phân tích cú pháp msg.payload nếu nó là chuỗi JSON
            var payload;
            try {
                payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
            } catch (e) {
                node.warn("Không thể phân tích cú pháp msg.payload. Payload hiện tại: " + msg.payload);
                return;
            }

            // Kiểm tra dữ liệu payload
            if (!payload || !Array.isArray(payload.accel) || payload.accel.length !== 3) {
                node.warn("Dữ liệu accel không hợp lệ hoặc bị thiếu trong msg.payload. Payload hiện tại: " + JSON.stringify(payload));
                return;
            }

            // Lấy mảng dữ liệu từ context, nếu chưa có thì khởi tạo mảng rỗng
            var tableData = node.context().get('tableData') || [];

            // Tạo đối tượng để thêm vào bảng
            var dataEntry = {};

            // Thêm thời gian
            dataEntry.timestamp = formatTimestamp(new Date());

            // Thêm dữ liệu từ payload
            dataEntry.dataType = "accel";
            dataEntry.x = payload.accel[0] ? payload.accel[0].toFixed(2) : "N/A";
            dataEntry.y = payload.accel[1] ? payload.accel[1].toFixed(2) : "N/A";
            dataEntry.z = payload.accel[2] ? payload.accel[2].toFixed(2) : "N/A";

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
    RED.nodes.registerType("acceleration-filter-ui-table", AccelDataNode);
};
