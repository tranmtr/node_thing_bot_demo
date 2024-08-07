module.exports = function(RED) {
    function SumOfDigits(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            // Giả sử msg.payload là một chuỗi chứa các chữ số
            var payload = msg.payload;
            var sum = 0;

            for(var i = 0; i < payload.length; i++)
            {
                var digit = parseInt(payload.charAt(i));
                if(!isNaN(digit))
                {
                    sum += digit;
                }
            }
            msg.payload = sum;
            node.send(msg);
        });
    }
    RED.nodes.registerType("sum-of-digits", SumOfDigits);
}