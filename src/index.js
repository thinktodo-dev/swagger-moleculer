/*
 * moleculer-web-swagger
 * Copyright (c) 2018 phantomk (https://github.com/phantomk)
 * MIT Licensed
 */

"use strict";
const _ = require("lodash");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const fastify = require("fastify");
const swaggerSpecification = require("./specification.json");

/**
 * Official API Gateway service for Moleculer
 */
module.exports = {
	// Service name
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
	  schemas: {},
	  routes: [],
	  tags: [],
	  servers:[]
	},
  
	/**
	 * Service created lifecycle event handler
	 */
	created() {
	  if (this.settings.expose === false) return;
  
	  this.settings.swagger = Object.assign(
		swaggerSpecification,
		this.settings.swagger
	  );
  
	  this.server = fastify();
	  this.server.register(require("fastify-static"), {
		root: path.join(__dirname, "../swagger"),
		prefix: "/" // optional: default '/'
	  });
	},
  
	actions: {},
  
	methods: {
	  /**
	   * Create route object from options
	   *
	   * @param {Object} opts
	   * @returns {Object}
	   */
	  createSwagger(opts, schema, tags,servers) {
		if (this.settings.swaggerCache) {
		  return this.settings.swaggerCache;
		} 
		let swaggerObject = swaggerSpecification;
		// reset
		swaggerObject.tags = tags;
		swaggerObject.paths = {};
		swaggerObject.servers = servers;
		swaggerObject.components.schemas = schema;
		if (swaggerObject.info.title === "") {
		  const pkg = JSON.parse(
			fs.readFileSync(path.join(__dirname, "package.json"))
		  );
		  swaggerObject.info.title = pkg.name;
		}
		for (let opt of opts) {
		  Object.assign(swaggerObject.paths, this.createSwaggerPath(opt));
		}
		delete swaggerObject.consumes;
		delete swaggerObject.produces;
		this.settings.swaggerCache = swaggerObject;
		return swaggerObject;
	  },
	  createSwaggerPath(opts) {
		this.logger.info(`add '${opts.path}' to swagger`);
		let route = {
		  opts,
		  middlewares: []
		};
		if (opts.authorization) {
		  if (!_.isFunction(this.authorize)) {
			this.logger.warn(
			  "Define 'authorize' method in the service to enable authorization."
			);
			route.authorization = false;
		  } else route.authorization = true;
		}
		if (opts.authentication) {
		  if (!_.isFunction(this.authenticate)) {
			this.logger.warn(
			  "Define 'authenticate' method in the service to enable authentication."
			);
			route.authentication = false;
		  } else route.authentication = true;
		}
		//Parameters
  
		// Create URL prefix
		const globalPath =
		  this.settings.path && this.settings.path != "/"
			? this.settings.path
			: "";
		route.path = globalPath + (opts.path || "");
		route.path = route.path || "/";
		const createPath = (matchPath, doc) => {
		  let method = "*";
		  if (matchPath.indexOf(" ") !== -1) {
			const p = matchPath.split(/\s+/);
			method = p[0];
			matchPath = p[1];
		  }
		  if (matchPath.startsWith("/")) matchPath = matchPath.slice(1);
  
		  this.logger.info(
			`add to swagger: ${method} ${route.path +
			  (route.path.endsWith("/") ? "" : "/")}${matchPath}`
		  );
		  let swaggerPath = {
			[`${method} ${route.path +
			  (route.path.endsWith("/") ? "" : "/")}${matchPath}`]: {
			  [method.toLowerCase()]: {
				tags: doc.tags,
				summary: "",
				description: doc.description,
				operationId: "",
				consumes: this.settings.swagger.consumes || [
				  "application/json",
				  "application/xml"
				],
				produces: this.settings.swagger.produces || [
				  "application/xml",
				  "application/json"
				],
				parameters: doc.parameters,
				security: doc.security,
				responses: {
				  200: {
					description: "success !"
				  }
				}
			  }
			}
		  };
		  return swaggerPath;
		};
		let paths = {};
		// Handle aliases
		if (opts.aliases && Object.keys(opts.aliases).length > 0) {
		  route.aliases = [];
		  Object.keys(opts.aliases).map((matchPath, index) => {
			if (Object.values(opts.aliases)[index].swaggerDoc) {
			  Object.assign(
				paths,
				createPath(
				  matchPath,
				  Object.values(opts.aliases)[index].swaggerDoc
				)
			  );
			}
		  });
		}
		return paths;
	  }
	},
	/**
	 * Service started lifecycle event handler
	 */
	started() {
	  if (this.settings.middleware) return;
	  // Process routes
	  this.swagger = this.createSwagger(
		this.settings.routes,
		this.settings.schemas,
		this.settings.tags,
		this.settings.servers
	  );
	  this.server.get("/", (req, res) => {
		res.sendFile("index.html");
	  });
  
	  this.server.get("/yml", (req, res) => {
		res.type("application/x-yaml");
		res.send(
		  yaml.safeDump(this.settings.swaggerCache, { skipInvalid: true })
		);
	  });
  
	  this.server.get("/json", (req, res) => {
		res.send(this.settings.swaggerCache);
	  });
  
	  this.server.listen(this.settings.port, (err, address) => {
		if (err) throw err;
		this.logger.info(`Swagger listening on ${address}`);
	  });
	},
  
	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {
	  if (this.timer) {
		clearInterval(this.timer);
		this.timer = null;
	  }
  
	  if (this.server.listening) {
		/* istanbul ignore next */
		this.server.server.close(err => {
		  if (err) return this.logger.error("Swagger close error!", err);
  
		  this.logger.info("Swagger stopped!");
		});
	  }
	}
  };
  