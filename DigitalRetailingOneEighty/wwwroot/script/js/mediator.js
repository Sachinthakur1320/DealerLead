//mediator
var Mediator = Mediator || function(obj){
	if (!obj) obj = {};

	var channels = obj.channels = {};

	obj.subscribe = function (channel, subscription, namespace) {
		channel = channel.split(' ');
		
		for (var i = 0, j = channel.length; i < j; i++){
			if (!channels[channel[i]]) channels[channel[i]] = [];
			if (namespace) subscription.__ns__ = namespace;
			channels[channel[i]].push(subscription);
		}
	};

	obj.publish = function (channel) {
		channel = channel.split(' ');
		
		for (var i = 0, j = channel.length; i < j; i++){
			if (!channels[channel[i]]) continue;
			
			var args = [].slice.call(arguments, 1);
			for (var k = 0, l = channels[channel[i]].length; k < l; k++) {
				channels[channel[i]][k].apply(this, args);
			}
		}
	};

	obj.destroy = function(namespace){
		if (namespace){
			for (var key in channels){
				var channel = channels[key];
				for (var i = 0; i < channel.length; i++){
					var subscription = channel[i];
					if (subscription.__ns__ && subscription.__ns__ === namespace){
						channel.splice(i, 1);
						i--;
					}
				}
			}
		} else {
			obj.channels = {};
		}
	}
	
	return obj;
};