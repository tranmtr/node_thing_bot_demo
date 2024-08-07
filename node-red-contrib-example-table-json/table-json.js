module.exports = function(RED) {
    function TableJson(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            
            var headers = Object.keys(msg.payload[0]); // Lấy tên các thuộc tính từ đối tượng đầu tiên
            var data = msg.payload.slice(1); // Lấy dữ liệu từ hàng thứ hai trở đi
            var result = [];

            for (var i = 0; i < data.length; i++) {
                var obj = {};
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = data[i][headers[j]]; // Sử dụng tên thuộc tính để lấy giá trị
                }
                result.push(obj);
            }

            msg.payload = result; // Gán kết quả vào msg.payload
            node.send(msg);
        });
    }
    RED.nodes.registerType("table-json", TableJson);
}