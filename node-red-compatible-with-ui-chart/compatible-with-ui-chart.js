module.exports = function(RED) {
    function CompatibleWithUIChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on('input', function(msg) {
            msg.payload = msg.payload.dataValue;
            node.send(msg);
        });
    }

    RED.nodes.registerType("compatible-with-ui-chart", CompatibleWithUIChartNode);
}
