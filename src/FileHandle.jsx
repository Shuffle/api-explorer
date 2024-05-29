import { useLocation } from "react-router-dom"
import YAML from "yaml"
import { useState, useEffect } from "react"
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import React from 'react';
import ApiExplorer from './ApiExplorer.jsx'



const FileHandle = () => {
  const loc = useLocation()
  const increaseAmount = 50;
  const [value, setValue] = useState(undefined);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState("");
  const [serverurl,setServerUrl] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [newWorkflowTags, setNewWorkflowTags] = React.useState([]);
  const [newWorkflowCategories, setNewWorkflowCategories] = React.useState([]);
  const [projectCategories, setProjectCategories] = useState([]);

  const [basedata, setBasedata] = React.useState({});
  const [actions, setActions] = useState([]);
  const [actionAmount, setActionAmount] = useState(increaseAmount);
  const [filteredActions, setFilteredActions] = useState([]);


  //client_credentials
 const handleGetRef = (parameter, data) => {
    try {
      if (parameter === null || parameter["$ref"] === undefined) {
        console.log("$ref not found in getref for: ", parameter)
        return parameter;
      }
    } catch (e) {
      console.log("Failed getting $ref of ", parameter);
      return parameter;
    }

    const paramsplit = parameter["$ref"].split("/");
    if (paramsplit[0] !== "#") {
      console.log("Bad param: ", paramsplit);
      return parameter;
    }

    var newitem = data;
    for (let paramkey in paramsplit) {
      var tmpparam = paramsplit[paramkey];
      if (tmpparam === "#") {
        continue;
      }

      if (newitem[tmpparam] === undefined) {
        return parameter;
      }

      newitem = newitem[tmpparam];
    }

    console.log("NEW ITEM: ", newitem)
    console.log("DATA: ", data)

    return newitem;
  };



	// From 2023: Example to handle action labels
	// Goal: Make this dynamically load from the backend
	// and make categories + labels modifyable.
	// Categories are the main categories in the App Framework
const parseIncomingOpenapiData = (data) => {
    var jsonvalid = false;
    try {
      data = JSON.parse(data);
      jsonvalid = true;
    } catch (e) {
      console.log("Error JSON: ", e);
    }

    if (!jsonvalid) {
      try {
        data = YAML.parse(data);
        jsonvalid = true;
      } catch (e) {
        console.log("Error YAML: ", e);
      }
    }

    setBasedata(data);
		console.log("Info: ", data)

		try { 
			if (data.info !== null && data.info !== undefined) {
				if (data.info.title !== undefined && data.info.title !== null) {
					if (data.info.title.endsWith(" API")) {
						data.info.title = data.info.title.substring(0, data.info.title.length - 4)
					} else if (data.info.title.endsWith("API")) {
						data.info.title = data.info.title.substring(0, data.info.title.length - 3)
					}

					if (data.info.title.length > 29) {
						setName(data.info.title.slice(0, 29));
					} else {
						setName(data.info.title);
					}
				}

				setDescription(data.info.description);
				document.title = "Apps - " + data.info.title;

				if (data.info["x-logo"] !== undefined) {
					if (data.info["x-logo"].url !== undefined) {
						//console.log("PARSED LOGO: ", data.info["x-logo"].url);
						setFileBase64(data.info["x-logo"].url);
					} else {
						setFileBase64(data.info["x-logo"]);
					}
					//console.log("");
					//console.log("");
					//console.log("LOGO: ", data.info["x-logo"]);
					//console.log("");
					//console.log("");
				}

				if (data.info.contact !== undefined) {
					setContact(data.info.contact);
				}

				if (data.info["x-categories"] !== undefined && data.info["x-categories"].length > 0) {
					if (typeof data.info["x-categories"] === "array") {
					} else {
					}
					setNewWorkflowCategories(data.info["x-categories"]);
				}
			}
		} catch (e) {
			console.log("Failed setting info: ", e)
		}

		console.log("Tags: ", data.tags)
		try {
			if (data.tags !== undefined && data.tags.length > 0) {
				var newtags = [];
				for (let tagkey in data.tags) {
					if (data.tags[tagkey].name.length > 50) {
						console.log("Skipping tag because it's too long: ",data.tags[tagkey].name.length);

						continue;
					}

					newtags.push(data.tags[tagkey].name);
				}

				if (newtags.length > 10) {
					newtags = newtags.slice(0, 9);
				}

				setNewWorkflowTags(newtags);
			}
		} catch (e) {
			console.log("Failed to parse tags: ", e)
		}

    // This is annoying (:
		console.log("Security schemes 1: ", data.securitySchemes)

		// Weird generator problems to be handle
		var securitySchemes = undefined
		try { 
			if (data.securitySchemes !== undefined) {
				securitySchemes = data.securitySchemes
				if (securitySchemes === undefined) {
					securitySchemes = data.securityDefinitions;
				}
			}
			
			if (securitySchemes === undefined && data.components !== undefined) { 
				securitySchemes = data.components.securitySchemes;
				if (securitySchemes === undefined) {
					securitySchemes = data.components.securityDefinitions;
				}
			}
		} catch (e) {
			console.log("Failed to parse security schemes: ", e)
		}

		console.log("Security schemes 2: ", securitySchemes)

    const allowedfunctions = [
      "GET",
      "CONNECT",
      "HEAD",
      "DELETE",
      "POST",
      "PATCH",
      "PUT",
    ];


    var newActions = [];
    var wordlist = {};
    var all_categories = [];
	var parentUrl = ""

	console.log("Paths: ", data.paths)
    if (data.paths !== null && data.paths !== undefined) {
      for (let [path, pathvalue] of Object.entries(data.paths)) {

        for (let [method, methodvalue] of Object.entries(pathvalue)) {
          if (methodvalue === null) {
            continue;
          }

          if (!allowedfunctions.includes(method.toUpperCase())) {
            // Typical YAML issue
            if (method !== "parameters") {
              console.log("Invalid method: ", method, "data: ", methodvalue);
              //toast("Skipped method (not allowed): " + method);
            }
            continue;
          }

					//console.log("METHOD: ", methodvalue)
          var tmpname = methodvalue.summary;
          if (
            methodvalue.operationId !== undefined &&
            methodvalue.operationId !== null &&
            methodvalue.operationId.length > 0 &&
            (tmpname === undefined || tmpname.length === 0)
          ) {
            tmpname = methodvalue.operationId;
          }

			if (tmpname !== undefined && tmpname !== null) {
	tmpname = tmpname.replaceAll(".", " ");
			}

			if ((tmpname === undefined || tmpname === null) && methodvalue.description !== undefined && methodvalue.description !== null && methodvalue.description.length > 0) {
				tmpname = methodvalue.description.replaceAll(".", " ").replaceAll("_", " ")
			}

            var newaction = {
              name: tmpname,
              description: methodvalue.description,
              url: path,
              file_field: "",
              method: method.toUpperCase(),
              headers: "",
              queries: [],
              paths: [],
              body: "",
              errors: [],
              example_response: "",
              action_label: "No Label",
              required_bodyfields: [],
            };

			if (methodvalue["x-label"] !== undefined && methodvalue["x-label"] !== null) {
				// FIX: Map labels only if they're actually in the category list
				newaction.action_label = methodvalue["x-label"]
			}

			if (methodvalue["x-required-fields"] !== undefined && methodvalue["x-required-fields"] !== null) {
				newaction.required_bodyfields = methodvalue["x-required-fields"]
			}

			if (newaction.url !== undefined && newaction.url !== null && newaction.url.includes("_shuffle_replace_")) {
				//const regex = /_shuffle_replace_\d/i;
				const regex = /_shuffle_replace_\d+/i
				
				newaction.url = newaction.url.replaceAll(new RegExp(regex, 'g'), "")
			}

          // Finding category
          if (path.includes("/")) {
            const pathsplit = path.split("/");
            // Stupid way of finding a category/grouping
            for (let splitkey in pathsplit) {
				if (pathsplit[splitkey].includes("_shuffle_replace_")) {
					//const regex = /_shuffle_replace_\d/i;
					const regex = /_shuffle_replace_\d+/i
					//console.log("NEW: ", 
					pathsplit[splitkey] = pathsplit[splitkey].replaceAll(new RegExp(regex, 'g'), "")
				}

              if (
                pathsplit[splitkey].length > 0 &&
                pathsplit[splitkey] !== "v1" &&
                pathsplit[splitkey] !== "v2" &&
                pathsplit[splitkey] !== "api" &&
                pathsplit[splitkey] !== "1.0" &&
                pathsplit[splitkey] !== "apis"
              ) {
                newaction["category"] = pathsplit[splitkey];
                if (!all_categories.includes(pathsplit[splitkey])) {
                  all_categories.push(pathsplit[splitkey]);
                }
                break;
              }
            }
          }
					
			if (path === "/files/{file_id}/content") {
				//console.log("FILE DOWNLOAD Method: ", path, method, methodvalue)
			}


          // Typescript? I think not ;)
          if (methodvalue["requestBody"] !== undefined) {
            if (methodvalue["requestBody"]["$ref"] !== undefined && methodvalue["requestBody"]["$ref"] !== null) {
							// Handle ref
							//
							console.log("Ref: ", methodvalue["requestBody"]["$ref"])
              const parameter = handleGetRef({ $ref:  methodvalue["requestBody"]["$ref"]}, data);
							console.log("PARAM: ", parameter)
							if (parameter.content !== undefined && parameter.content !== null) {
								methodvalue["requestBody"]["content"] = parameter.content
								console.log("Set content!")
							}
						}

						if (methodvalue["requestBody"]["content"] !== undefined) {
							// Handle content - XML or JSON
							//
              if (
                methodvalue["requestBody"]["content"]["application/json"] !==
                undefined
              ) {
                //newaction["headers"] = ""
                //"Content-Type=application/json\nAccept=application/json";
                if (
                  methodvalue["requestBody"]["content"]["application/json"]["schema"] !== undefined && methodvalue["requestBody"]["content"]["application/json"]["schema"] !== null
                ) {
                  //console.log("Schema: ", methodvalue["requestBody"]["content"]["application/json"]["schema"])

									try {
										if (methodvalue["requestBody"]["content"]["application/json"]["schema"]["properties"] !== undefined) {
											// Read out properties from a JSON object
											const jsonObject = getJsonObject(methodvalue["requestBody"]["content"]["application/json"]["schema"]["properties"])
											//console.log("JSON OBJECT: ", jsonObject)
											if (jsonObject !== undefined && jsonObject !== null) {
												try {
													newaction["body"] = JSON.stringify(jsonObject, null, 2)
												} catch (e) {
													console.log("JSON object parse error: ", e)
												}
											}


											//newaction["body"] = JSON.stringify(jsonObject, null, 2);

											var tmpobject = {};
											for (let prop of methodvalue["requestBody"]["content"]["application/json"]["schema"]["properties"]) {
												tmpobject[prop] = `\$\{${prop}\}`;
											}

											//console.log("Data: ", data)
											for (let subkey in methodvalue["requestBody"]["content"]["application/json"]["schema"]["required"]) {
												const tmpitem = methodvalue["requestBody"]["content"]["application/json"]["schema"]["required"][subkey];
												tmpobject[tmpitem] = `\$\{${tmpitem}\}`;
											}

											newaction["body"] = JSON.stringify(tmpobject, null, 2);

										} else if (

											methodvalue["requestBody"]["content"]["application/json"]["schema"]["$ref"] !== undefined && methodvalue["requestBody"]["content"]["application/json"]["schema"]["$ref"] !== null) {
											const retRef = handleGetRef(methodvalue["requestBody"]["content"]["application/json"]["schema"], data);
											
											var newbody = {};
											// Can handle default, required, description and type
											for (let propkey in retRef.properties) {
												console.log("replace: ", propkey)

												const parsedkey = propkey.replaceAll(" ", "_").toLowerCase();
												newbody[parsedkey] = "${" + parsedkey + "}";
											}

											newaction["body"] = JSON.stringify(newbody, null, 2);
										}
									} catch (e) {
										console.log("RequestBody json error: ", e, path)
									}
                }
              } else if (
                methodvalue["requestBody"]["content"]["application/xml"] !==
                undefined
              ) {
                console.log("METHOD XML: ", methodvalue);
                //newaction["headers"] = ""
                //"Content-Type=application/xml\nAccept=application/xml";
                if (
                  methodvalue["requestBody"]["content"]["application/xml"][
                    "schema"
                  ] !== undefined &&
                  methodvalue["requestBody"]["content"]["application/xml"][
                    "schema"
                  ] !== null
                ) {
					try {
						if (
							methodvalue["requestBody"]["content"]["application/xml"][
								"schema"
							]["properties"] !== undefined
						) {
							var tmpobject = {};
							for (let [prop, propvalue] of Object.entries(methodvalue["requestBody"]["content"]["application/xml"]["schema"]["properties"])) {
							
								tmpobject[prop] = `\$\{${prop}\}`;
							}

							for (let [subkey,subkeyval] in Object.entries(methodvalue["requestBody"]["content"]["application/xml"]["schema"]["required"])) {
								const tmpitem =
									methodvalue["requestBody"]["content"][
										"application/xml"
									]["schema"]["required"][subkey];
								tmpobject[tmpitem] = `\$\{${tmpitem}\}`;
							}

							//console.log("OBJ XML: ", tmpobject)
							//newaction["body"] = XML.stringify(tmpobject, null, 2)
						}
					} catch (e) {
						console.log("RequestBody xml error: ", e, path)
					}
                }
              } else {
                if (methodvalue["requestBody"]["content"]["example"] !== undefined) {
                  if (methodvalue["requestBody"]["content"]["example"]["example"] !== undefined) {
                      newaction["body"] = methodvalue["requestBody"]["content"]["example"]["example"]
                  }
                } 
		  
				if (methodvalue["requestBody"]["content"]["multipart/form-data"] !== undefined) {
                  if (
                    methodvalue["requestBody"]["content"][
                      "multipart/form-data"
                    ]["schema"] !== undefined &&
                    methodvalue["requestBody"]["content"][
                      "multipart/form-data"
                    ]["schema"] !== null
                  ) {
										try {
											if (methodvalue["requestBody"]["content"]["multipart/form-data"]["schema"]["type"] === "object") {
												const fieldname =
													methodvalue["requestBody"]["content"][
														"multipart/form-data"
													]["schema"]["properties"]["fieldname"];

												if (fieldname !== undefined) {
													//console.log("FIELDNAME: ", fieldname);
													newaction.file_field = fieldname["value"];
												} else {
													for (const [subkey, subvalue] of Object.entries(methodvalue["requestBody"]["content"]["multipart/form-data"]["schema"]["properties"])) {
														if (subkey.includes("file")) {
															console.log("Found subkey field for file: ", path, method, methodvalue["requestBody"]["content"]["multipart/form-data"]["schema"]["properties"])
															newaction.file_field = subkey
															break
														}
													}

													if (newaction.file_field === undefined || newaction.file_field === null || newaction.file_field.length === 0) {
														console.log("No file fieldname found: ", methodvalue["requestBody"]["content"]["multipart/form-data"]["schema"]["properties"])
													}
												}
											} else {
												console.log("No type found: ", methodvalue["requestBody"]["content"]["multipart/form-data"]["schema"])
											}
										} catch (e) {
											console.log("Multipart/form error: ", e, path)
										}
                  }
                } else {
                  var schemas = [];
                  const content = methodvalue["requestBody"]["content"];
                  if (content !== undefined && content !== null) {
                    //console.log("CONTENT: ", content)
                    for (const [subkey, subvalue] of Object.entries(content)) {
                      if (subvalue["schema"] !== undefined && subvalue["schema"] !== null) {
                        console.log("SCHEMA: ", subvalue["schema"])
                        if (subvalue["schema"]["$ref"] !== undefined && subvalue["schema"]["$ref"] !== null) {

                          console.log("SCHEMA FOUND REF!")
                          if (!schemas.includes(subvalue["schema"]["$ref"])) {
                            schemas.push(subvalue["schema"]["$ref"]);
                          }
                        }
                      } else {
												if (subvalue["example"] !== undefined && subvalue["example"] !== null) {
                    			newaction["body"] = subvalue["example"]
												} else {
                        	console.log("ERROR: couldn't find schema for ", subvalue, method, path);
												}
                      }
                    }
                  }

									try {
                  	if (schemas.length === 1) {
                  	  const parameter = handleGetRef({ $ref: schemas[0] }, data);

											console.log("Reading type from parameter: ", parameter)
                  	  if (parameter.properties !== undefined && parameter["type"] === "object") {
                  	  
                  	    var newbody = {};
                  	    for (let propkey in parameter.properties) {
													console.log("propkey2: ", propkey)
                  	    	const parsedkey = propkey.replaceAll(" ", "_").toLowerCase();
                  	      if (parameter.properties[propkey].type === undefined) {
                  	        console.log(
                  	          "Skipping (4): ",
                  	          parameter.properties[propkey]
                  	        );
                  	        continue;
                  	      }

                  	      if (parameter.properties[propkey].type === "string") {
                  	        if (
                  	          parameter.properties[propkey].description !==
                  	          undefined
                  	        ) {
                  	          newbody[parsedkey] =
                  	            parameter.properties[propkey].description;
                  	        } else {
                  	          newbody[parsedkey] = "";
                  	        }
                  	      } else if (
                  	        parameter.properties[propkey].type.includes("int") ||
                  	        parameter.properties[propkey].type.includes("uint64")
                  	      ) {
                  	        newbody[parsedkey] = 0;
                  	      } else if (
                  	        parameter.properties[propkey].type.includes("boolean")
                  	      ) {
                  	        newbody[parsedkey] = false;
                  	      } else if (
                  	        parameter.properties[propkey].type.includes("array")
                  	      ) {
                  	        newbody[parsedkey] = [];
                  	      } else {
                  	        console.log(
                  	          "CANT HANDLE JSON TYPE (4)",
                  	          parameter.properties[propkey].type,
                  	          parameter.properties[propkey],
															path
                  	        );
                  	        newbody[parsedkey] = [];
                  	      }
                  	    }

                  	    newaction["body"] = JSON.stringify(newbody, null, 2);
                  	  } else {
                  	    console.log(
                  	      "CANT HANDLE PARAM: (4) ",
                  	      parameter.properties,
													path
                  	    );
                  	  }
                  	}
				  } catch (e) {
				  	console.log("Param Error: ", e, path)
				  }
                }
              }
            }
          }

          if (
            methodvalue.responses !== undefined &&
            methodvalue.responses !== null
          ) {
            if (methodvalue.responses.default !== undefined) {
              if (methodvalue.responses.default.content !== undefined) {
                if (
                  methodvalue.responses.default.content["text/plain"] !==
                  undefined
                ) {
                  if (
                    methodvalue.responses.default.content["text/plain"]["schema"] !== undefined) {
                    if (methodvalue.responses.default.content["text/plain"]["schema"]["example"] !== undefined) {
                      newaction.example_response = methodvalue.responses.default.content["text/plain"]["schema"]["example"]
                        
                        

                    }

                    if (methodvalue.responses.default.content["text/plain"]["schema"]["format"] === "binary" && methodvalue.responses.default.content["text/plain"]["schema"]["type"] === "string") {
                  		newaction.example_response = "shuffle_file_download"
					}
                  }
                }
              }
            } else {
              var selectedReturn = "";
              if (methodvalue.responses["200"] !== undefined) {
                selectedReturn = "200";
              } else if (methodvalue.responses["201"] !== undefined) {
                selectedReturn = "201";
              }

              // Parsing examples. This should be standardized lol
              if (methodvalue.responses[selectedReturn] !== undefined) {
                const selectedExample = methodvalue.responses[selectedReturn];
                if (selectedExample["content"] !== undefined) {
                  if (
                    selectedExample["content"]["application/json"] !== undefined
                  ) {
                    if (
                      selectedExample["content"]["application/json"]["schema"] !== undefined &&
                    	selectedExample["content"]["application/json"]["schema"] !== null
                    ) {
											//console.log("JSON Output: ", selectedExample["content"]["application/json"]["schema"])

											if (selectedExample["content"]["application/json"]["schema"]["properties"] !== undefined && selectedExample["content"]["application/json"]["schema"]["properties"] !== null) {
												const jsonObject = getJsonObject(selectedExample["content"]["application/json"]["schema"]["properties"]) 
												if (jsonObject !== undefined && jsonObject !== null) {
													try {
                          	newaction.example_response = JSON.stringify(jsonObject, null, 2)
													} catch (e) {
														console.log("JSON object output parse error: ", e)
													}
												}
											}

                      if (selectedExample["content"]["application/json"]["schema"]["$ref"] !== undefined) {
                        //console.log("REF EXAMPLE: ", selectedExample["content"]["application/json"]["schema"])
                        const parameter = handleGetRef(
                          selectedExample["content"]["application/json"][
                            "schema"
                          ],
                          data
                        );

                        //console.log("Reading parameter type 2", parameter)
                        if (parameter.properties !== undefined && parameter["type"] === "object") {
                          var newbody = {};
                          for (let propkey in parameter.properties) {
														//console.log("propkey3: ", propkey)

                            const parsedkey = propkey.replaceAll(" ", "_").toLowerCase();
                            if (parameter.properties[propkey].type === undefined) {
                              console.log(
                                "Skipping (1): ",
                                parameter.properties[propkey]
                              );
                              continue;
                            }

                            if (
                              parameter.properties[propkey].type === "string"
                            ) {
                              if (
                                parameter.properties[propkey].description !==
                                undefined
                              ) {
                                newbody[parsedkey] =
                                  parameter.properties[propkey].description;
                              } else {
                                newbody[parsedkey] = "";
                              }
                            } else if (
                              parameter.properties[propkey].type.includes("int")
                            ) {
                              newbody[parsedkey] = 0;
                            } else if (
                              parameter.properties[propkey].type.includes(
                                "boolean"
                              )
                            ) {
                              newbody[parsedkey] = false;
                            } else if (
                              parameter.properties[propkey].type.includes(
                                "array"
                              )
                            ) {
                              //console.log("Added empty array. Base is: ", parameter.properties[propkey].type)

                              //const parameter = handleGetRef(selectedExample["content"]["application/json"]["schema"], data)
                              newbody[parsedkey] = [];
                            } else {
                              console.log("CANT HANDLE JSON TYPE ", parameter.properties[propkey].type,parameter.properties[propkey]
                              );
                              newbody[parsedkey] = [];
                            }
                          }
                          newaction.example_response = JSON.stringify(
                            newbody,
                            null,
                            2
                          );
                        } else {
                          console.log(
                            "CANT HANDLE PARAM: (1) ",
                            parameter.properties
                          );
                        }
                      } else {
                        // Just selecting the first one. bleh.
                        if (
                          selectedExample["content"]["application/json"][
                            "schema"
                          ]["allOf"] !== undefined
                        ) {
                          //console.log("ALLOF: ", selectedExample["content"]["application/json"]["schema"]["allOf"])
                          //console.log("BAD EXAMPLE: (SKIP ALLOF) ", selectedExample["content"]["application/json"]["schema"]["allOf"])
                          var selectedComponent =
                            selectedExample["content"]["application/json"][
                              "schema"
                            ]["allOf"];
                          if (selectedComponent.length >= 1) {
                            selectedComponent = selectedComponent[0];

                            const parameter = handleGetRef(
                              selectedComponent,
                              data
                            );

														console.log("Reading parameter type 3!")
                            if (parameter.properties !== undefined && parameter["type"] === "object") {
                              var newbody = {};
                              for (let propkey in parameter.properties) {
																console.log("propkey4: ", propkey)
                                const parsedkey = propkey.replaceAll(" ", "_").toLowerCase();
                                if (
                                  parameter.properties[propkey].type ===
                                  undefined
                                ) {
                                  console.log(
                                    "Skipping (2): ",
                                    parameter.properties[propkey]
                                  );
                                  continue;
                                }

                                if (
                                  parameter.properties[propkey].type ===
                                  "string"
                                ) {
                                  if (
                                    parameter.properties[propkey]
                                      .description !== undefined
                                  ) {
                                    newbody[parsedkey] =
                                      parameter.properties[propkey].description;
                                  } else {
                                    newbody[parsedkey] = "";
                                  }
                                } else if (
                                  parameter.properties[propkey].type.includes(
                                    "int"
                                  )
                                ) {
                                  newbody[parsedkey] = 0;
                                } else if (
                                  parameter.properties[propkey].type.includes(
                                    "boolean"
                                  )
                                ) {
                                  newbody[parsedkey] = false;
                                } else {
                                  console.log(
                                    "CANT HANDLE JSON TYPE (2) ",
                                    parameter.properties[propkey].type
                                  );
                                  newbody[parsedkey] = [];
                                }
                              }

                              newaction.example_response = JSON.stringify(
                                newbody,
                                null,
                                2
                              );
                              //newaction.example_response = JSON.stringify(parameter.properties, null, 2)
                            } else {
                              //newaction.example_response = parameter.properties
                              console.log(
                                "CANT HANDLE PARAM: (3) ",
                                parameter.properties
                              );
                            }
                          } else {
                          }
                        } else if (
                          selectedExample["content"]["application/json"][
                            "schema"
                          ]["properties"] !== undefined
                        ) {
                          if (
                            selectedExample["content"]["application/json"][
                              "schema"
                            ]["properties"]["data"] !== undefined
                          ) {
                            const parameter = handleGetRef(
                              selectedExample["content"]["application/json"][
                                "schema"
                              ]["properties"]["data"],
                              data
                            );

														console.log("Reading type 3: ", parameter)
                            if (parameter.properties !== undefined && parameter["type"] === "object") {
                              var newbody = {};
                              for (let propkey in parameter.properties) {
																console.log("propkey5: ", propkey)
                                const parsedkey = propkey
                                  .replaceAll(" ", "_")
                                  .toLowerCase();
                                if (
                                  parameter.properties[propkey].type ===
                                  undefined
                                ) {
                                  console.log(
                                    "Skipping (3): ",
                                    parameter.properties[propkey]
                                  );
                                  continue;
                                }

                                if (
                                  parameter.properties[propkey].type ===
                                  "string"
                                ) {
                                  if (
                                    parameter.properties[propkey]
                                      .description !== undefined
                                  ) {
                                    newbody[parsedkey] =
                                      parameter.properties[propkey].description;
                                  } else {
                                    newbody[parsedkey] = "";
                                  }
                                  console.log(parameter.properties[propkey]);
                                } else if (
                                  parameter.properties[propkey].type.includes(
                                    "int"
                                  )
                                ) {
                                  newbody[parsedkey] = 0;
                                } else {
                                  console.log(
                                    "CANT HANDLE JSON TYPE (3) ",
                                    parameter.properties[propkey].type
                                  );
                                  newbody[parsedkey] = [];
                                }
                              }

                              newaction.example_response = JSON.stringify(
                                newbody,
                                null,
                                2
                              );
                              //newaction.example_response = JSON.stringify(parameter.properties, null, 2)
                            } else {
                              //newaction.example_response = parameter.properties
                              console.log(
                                "CANT HANDLE PARAM: (3) ",
                                parameter.properties
                              );
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          for (let paramkey in methodvalue.parameters) {
            const parameter = handleGetRef(methodvalue.parameters[paramkey], data);
            if (parameter.in === "query") {
              var tmpaction = {
                description: parameter.description,
                name: parameter.name,
                required: parameter.required,
                in: "query",
              };

			  if (parameter.example !== undefined && parameter.example !== null) {
				  tmpaction.example = parameter.example
			  }

              if (parameter.required === undefined) {
                tmpaction.required = false;
              }

              newaction.queries.push(tmpaction);
            } else if (parameter.in === "path") {
              // FIXME - parse this to the URL too
              newaction.paths.push(parameter.name);

              // FIXME: This doesn't follow OpenAPI3 exactly.
              // https://swagger.io/docs/specification/describing-request-body/
              // https://swagger.io/docs/specification/describing-parameters/
              // Need to split the data.
            } else if (parameter.in === "body") {
              // FIXME: Add tracking for components
              // E.G: https://raw.githubusercontent.com/owentl/Shuffle/master/gosecure.yaml
              if (parameter.example !== undefined && parameter.example !== null) {
				  if (newaction.body === undefined || newaction.body === null || newaction.body.length < 5) {
                	newaction.body = parameter.example
				  }
              }
            } else if (parameter.in === "header") {
              newaction.headers += `${parameter.name}=${parameter.example}\n`;
            } else {
              console.log(
                "WARNING: don't know how to handle this param: ",
                parameter
              );
            }
          }

		  // Check if body is valid JSON. 
		  if (newaction.body !== undefined && newaction.body !== null && newaction.body.length > 0) {
			  // Trim starting / ending newlines, spaces and tabs
			  newaction.body = newaction.body.trim()
		  }


          if (newaction.name === "" || newaction.name === undefined) {
            // Find a unique part of the string
            // FIXME: Looks for length between /, find the one where they differ
            // Should find others with the same START to their path
            // Make a list of reserved names? Aka things that show up only once
            if (Object.getOwnPropertyNames(wordlist).length === 0) {
              for (let [newpath, pathvalue] of Object.entries(data.paths)) {
                const newpathsplit = newpath.split("/");

                for (let splitkey in newpathsplit) {
                  const pathitem = newpathsplit[splitkey].toLowerCase();
                  if (wordlist[pathitem] === undefined) {
                    wordlist[pathitem] = 1;
                  } else {
                    wordlist[pathitem] += 1;
                  }
                }
              }
            }

            //console.log("WORDLIST: ", wordlist)

            // Remove underscores and make it normal with upper case etc
            const urlsplit = path.split("/");
            if (urlsplit.length > 0) {
              var curname = "";
              for (let urlkey in urlsplit) {
                var subpath = urlsplit[urlkey];
                if (wordlist[subpath] > 2 || subpath.length < 1) {
                  continue;
                }

                curname = subpath;
                break;
              }

              // FIXME: If name exists,
              // FIXME: Check if first part of parsedname is verb, otherwise use method
              const parsedname = curname
                .split("_")
                .join(" ")
                .split("-")
                .join(" ")
                .split("{")
                .join(" ")
                .split("}")
                .join(" ")
                .trim();
              if (parsedname.length === 0) {
                newaction.errors.push("Missing name");
              } else {
                const newname =
                  method.charAt(0).toUpperCase() +
                  method.slice(1) +
                  " " +
                  parsedname;
                const searchactions = newActions.find(
                  (data) => data.name === newname
                );

                //console.log("SEARCH: ", searchactions);
                if (searchactions !== undefined) {
                  newaction.errors.push("Missing name");
                } else {
                  newaction.name = newname;
                }
              }
            } else {
              newaction.errors.push("Missing name");
            }
          }

					//newaction.action_label = "No Label"
          newActions.push(newaction);
        }
      }


      if (data.servers !== undefined && data.servers.length > 0) {
        var firstUrl = data.servers[0].url;
        if (
          firstUrl.includes("{") &&
          firstUrl.includes("}") &&
          data.servers[0].variables !== undefined
        ) {
          const regex = /{\w+}/g;
          const found = firstUrl.match(regex);
          if (found !== null) {
            for (let foundkey in found) {
              const item = found[foundkey].slice(1, found[foundkey].length - 1);
              const foundVar = data.servers[0].variables[item];
              if (foundVar["default"] !== undefined) {
                firstUrl = firstUrl.replace(found[foundkey], foundVar["default"]);
              }
            }
          }
        }

        if (firstUrl.endsWith("/")) {
          setBaseUrl(firstUrl.slice(0, firstUrl.length - 1));
					parentUrl = firstUrl.slice(0, firstUrl.length - 1)
        } else {
          setBaseUrl(firstUrl)
					parentUrl = firstUrl
        }
      }
    }
		var prefixCheck = "/v1"
		if (parentUrl.includes("/")) {
			const urlsplit = parentUrl.split("/")
			if (urlsplit.length > 2) {
				// Skip if http:// in it too
				prefixCheck = "/" + urlsplit.slice(3).join("/")
			}

			console.log("Prefix: ", prefixCheck)
			if (prefixCheck.length > 0 && prefixCheck !== "/" && prefixCheck.startsWith("/")) {
				for (var actionKey in newActions) {
					const action = newActions[actionKey]

					if (action.url !== undefined && action.url !== null && action.url.startsWith(prefixCheck)) {
						newActions[actionKey].url = action.url.slice(prefixCheck.length, action.url.length)
					}

					console.log("Action: ", newActions[actionKey].url)
				}
			}
		}

		console.log("Actions: ", newActions.length, " BaseURL: ", parentUrl)
		setServerUrl(parentUrl)
	        console.log("Actions: ", newActions)
		var newActions2 = []
		// Remove with duplicate action URLs
		for (var actionKey in newActions) {
			const action = newActions[actionKey]
			if (action.url === undefined || action.url === null) {
				continue
			}

			var found = false
			for (var actionKey2 in newActions2) {
				const action2 = newActions2[actionKey2]
				if (action2.url === undefined || action2.url === null) {
					continue
				}

				if (action.url === action2.url) {
					found = true
					break
				}
			}

			if (!found) {
				newActions2.push(action)
			} else {
				//console.log("NOT skipping duplicate action: ", action.url, ". Should merge contents")
				newActions2.push(action)
			}
		}

		//console.log("Actions: ", newActions.length, " Actions2: ", newActions2.length)
		newActions = newActions2
    if (newActions.length > increaseAmount - 1) {
      setActionAmount(increaseAmount);
    } else {
      setActionAmount(newActions.length);
    }

    setProjectCategories(all_categories);

	// Rearrange them by which has action_label
	const firstActions = newActions.filter(data => data.action_label !== undefined && data.action_label !== null && data.action_label !== "No Label")
	console.log("First actions: ", firstActions)
	const secondActions = newActions.filter(data => data.action_label === undefined || data.action_label === null || data.action_label === "No Label")
	newActions = firstActions.concat(secondActions)
    setActions(newActions);
		//data.paths[item.url][item.method.toLowerCase()]["x-label"] = item.action_label

    setFilteredActions(newActions);
    setIsAppLoaded(true);
  };

    useEffect(() => {
        const data = loc.state
        setValue(YAML.parse(data));
        parseIncomingOpenapiData(data);
    }, [])

    return (
        <div>
            {value 
                ?
                    <ApiExplorer info={value.info} actions={actions} serverurl={serverurl}></ApiExplorer>
                : 
                    'loaded'}
        </div>
    )
}


export default FileHandle;
