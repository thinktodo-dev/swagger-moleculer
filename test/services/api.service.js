const { ServiceBroker } = require("moleculer");
const ApiService = require("moleculer-web");
const swaggerService = require("../../index");

const broker = new ServiceBroker();

// // Load API Gateway
// broker.createService(ApiService);
module.exports = {
	name: "api",
	mixins: [swaggerService],

	settings: {
		routes: [
			{
				path: "/charge",
				aliases: {
					"POST create": {
						swaggerDoc: {
							description: "Load products by filter",
							tags: ["Products"],
							// parameters: [
							// 	{
							// 		in: "body",
							// 		name: "data",
							// 		type: "Object",
							// 		description: "Product filter",
							// 		required: true,
							// 		schema: {}
							// 	}
							// ]
						},
						actions: "greeter.hello"
					}
				},
				bodyParsers: {
					json: true,
					urlencoded: { extended: true }
				},
				whitelist: [
					// Access to any actions in all services under "/member" URL
					"**"
				]
			}
		]
	}
};
