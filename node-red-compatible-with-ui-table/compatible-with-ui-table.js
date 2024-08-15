module.exports = function(RED) {
    function CompatibleWithUITableNode(config) {
        RED.nodes.createNode(this, config);

        this.name = config.name;
        this.showDevice = config.showDevice;
        this.showSensorType = config.showSensorType;
        this.showDataType = config.showDataType;
        this.showTimestamp = config.showTimestamp;
        this.showValue = config.showValue;
        this.showDataValue = config.showDataValue;

        var node = this;

        node.on('input', function(msg) {
            var payload = msg.payload;
            var topic = msg.topic;
            // Lấy mảng dữ liệu từ context, nếu chưa có thì khởi tạo mảng rỗng
            var tableData = node.context().get('tableData') || [];

            // Tạo đối tượng để thêm vào bảng
            var dataEntry = {};

            if (node.showTimestamp) {
                dataEntry.timestamp = payload.timestamp; 
            }
            
            if (node.showDevice) {
                dataEntry.device = payload.device || "N/A";
            }
            if (node.showSensorType) {
                dataEntry.sensorType = payload.sensor|| "N/A";
            }
            if (node.showDataType) {
                dataEntry.dataType = payload.dataType || "N/A";
            }
            if (node.showValue) {
                dataEntry.value = payload.value || "N/A";
            }
                
            if(node.showDataValue) {
                dataEntry.showDataValue = payload.dataValue ||"N/A";
            }
            // Thêm đối tượng vào mảng dữ liệu
            tableData.push(dataEntry);
            /*
            // Chỉ giữ lại 10 giá trị cuối cùng
            if (tableData.length > 10) {
                tableData = tableData.slice(-10); // Giữ lại 10 phần tử cuối cùng
            }
            */
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
