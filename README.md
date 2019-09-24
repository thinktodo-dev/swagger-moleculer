# moleculer-web-swagger

![npm-veriosn](https://img.shields.io/npm/v/moleculer-web-swagger.svg)
![npm-dt](https://img.shields.io/npm/dt/moleculer-web-swagger.svg)

This is a swagger plugin for [moleculer-web](https://github.com/moleculerjs/moleculer-web) for [Moleculer microservices framework](https://github.com/moleculerjs/moleculer), just simple.

## Install

```bash
npm install moleculer-web-swagger --save
```

## Usage

Add a service `swagger.service.js`, here is all options.

```javascript
const SwaggerService = require("moleculer-web-swagger");
module.exports = {
	// Service name
	mixins: [SwaggerService],
	name: "swagger",
	settings: {
		middleware: false,
		port: 3002,
		ip: "0.0.0.0",
		expose: true,
		swagger: {
			info: {
				description: "Saigonrealty's APIs Document",
				version: "1.0.0",
				title: "Saigonrealty's APIs Document",
				termsOfService: "",
				contact: {
					name: "phantomk",
					url: "https://github.com/phantomk",
					email: "phantomk94@gmail.com"
				},
				license: {
					name: "Apache 2.0",
					url: "https://www.apache.org/licenses/LICENSE-2.0.html"
				}
			},
			host: "127.0.0.1:3002",
			basePath: "/v1",
			tags: [
				{
					name: "Saigonrealty",
					description: "All APIs in Saigonrealty",
					externalDocs: {
						description: "Find out more",
						url: "http://swagger.io"
					}
				}
			],
			schemes: ["http", "https"],
			consumes: ["application/json", "application/xml"],
			produces: ["application/xml", "application/json"]
		},
		schemas: {
			user: {
				type: "object",
				properties: {
					companyCode: {
						type: "string"
					},
					username: {
						type: "string"
					},
					password: {
						type: "string"
					}
				}
			}
		},
		routes: [
			{
				path: "/api/public",
				aliases: {
					// Admin login
					"POST login/admin": {
						swaggerDoc: {
							tags: ["Public"],
							description: "Login to admin page",
							parameters: [
								{
									in: "query",
									name: "username",
									type: "string",
									description: "",
									required: true,
									schema: {}
								},
								{
									in: "query",
									name: "password",
									type: "string",
									description: "",
									required: true,
									schema: {}
								}
							]
						},
						action: "admin.login"
					}
				}
			}
		],
		tags: [
			{
				name: "Public",
				description: "APIs public access"
			}
		],
		servers: [
			{
				url: "http://localhost:3000/",
				description: "Develop server"
			}
		]
	}
};

```

> Not support middleware

## Todo

-   [ ] Support whitelist
-   [ ] Support security
-   [ ] Support auto read route

## License

The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).
