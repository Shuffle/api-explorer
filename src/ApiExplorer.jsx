import {useState, useEffect} from "react";
import { CopyBlock, github } from 'react-code-blocks';
import  ReactJson from 'react-json-view';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const cUrl = async (url, method, data) => {
    const values = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer nCXHPHBqXOinWbZJRznj7VOrH3HmKYLw"
        },
        body: JSON.stringify(data)
    })
    return values
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ApiExplorer = ({actions, info, serverurl, moredata}) => {
    const [response, setResponse] = useState(undefined)
    const [data, setData] = useState(actions)
    const [curData, setCurData] = useState(data[0])
    const [remove, setRemove] = useState(info)
    const [baseurl, setBaseurl] = useState(serverurl)
    const [valueResponse, setIsResponse] = useState(false)
    const [state, setState] = useState({bottom: false})
    const [value, setValue] = useState(0);

    const handleChangeTab = (event, newValue) => {
        setValue(newValue);
    };

    const anchor = "bottom"

    useEffect(() => {
        console.log(valueResponse)
    }, [valueResponse])

    const toggleDrawer = (anchor, open) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }

      setState({ ...state, [anchor]: open });
      handleExecution()
    };

    const handleExecution = () => {
        const value = cUrl(`${baseurl + curData['url']}`, curData['method'], formData())
        value.then(response => response.json()).then(data => setIsResponse(data))
    }

    //name
    const handleChange = (index) => {
        console.log(moredata[data[index].name] ? moredata[data[index].name] : data[index])
        setCurData(data[index])
    }

    const formData = () => {
        const val = {}
        if (moredata[curData.name] !== undefined) {
            Object.entries(moredata[curData.name].properties).map(([key, value]) => {
                val[key] = value.example || value.default
            })
        }
        return val
    }

    const genCode = () => {
        return `curl "${baseurl + curData['url']}" \\
                -X "${curData['method']}"                                                             \\
                -H "Authorization: Bearer <API KEY>"                                                   \\
                -d '${JSON.stringify(formData())}'`
    }

    const AppActions = () => {
      return (
         // <button style={{"backgroundColor": "red", "minHeight": "40px", "marginLeft": "40px", marginTop: "10px"}} onClick={handleExecution}>
         //     Run
         // </button>
         <div style={{marginLeft: "20px", width: "50%"}}>
         <h2>
          {curData.name}
         </h2>
          <h4 style={{ color: "black" }}>Paramerters</h4>
            {moredata[curData.name] && moredata[curData.name].properties ? (
            Object.entries(moredata[curData.name].properties).map(([key, value]) => (
        <div style={{ marginLeft: "15px" }} key={key}>
            <pre>{key}</pre>
            <p style={{ marginLeft: "19px" }}>{value.description}</p>
            <hr style={{ border: "1px solid #213547" }} />
        </div>
    ))
) : (
    <div></div>
)}
          </div>

      )
    }


    // Click work?
//    useEffect(() => {
//        console.log(curData)
//    }, [curData])


    return ( 
        <div style={{display: "flex", flexDirection: "column", minHeight: "100%"}}>
            <div style={{display: "flex", paddingLeft: "21px", borderBottom: "1px solid black"}}>
                <h1 style={{paddingLeft: "5px"}}>
                    Shuffle - {info.title}
                </h1>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
                <Paper style={{display: "flex", flexDirection: "column", width: "15vw", height: "100vh"}}>
                    <ButtonGroup 
                        orientation="vertical"
                        variant="text">
                        {actions.map((action, index) => (
                             <Button key="one" style={{padding: "15px 0px 15px 0px", color: "#212121", fontWeight: "normal"}} onClick={() => handleChange(index)}>
                                <span style={{color: "green", fontSize: "12px", paddingRight: "10px", fontWeight: "bold"}}>{action.method}</span>
                                     {action.name}
                             </Button>
                        ))}
                    </ButtonGroup>
                </Paper>
                <div style={{display: "flex", flexDirection: "column"}}>
                 <div style={{display: "flex", flexDirection: "row", justifyContent: "center" ,width: "85vw", height: "5vh"}}>
                     <Box height={"6vh"} width={"60vw"} my={4} sx={{border: "0.1px solid grey", borderRadius: "4px"}}>
                         <Select value={curData.method} style={{height: "100%", width: "10%", border: "0px"}}>
                             <MenuItem value={"GET"}><span style={{color: "green", fontWeight: "bold"}}>GET</span></MenuItem>
                             <MenuItem value={"POST"}><span style={{color: "#AD7A03", fontWeight: "bold"}}>POST</span></MenuItem>
                             <MenuItem value={"PUT"}><span style={{color: "#0053B8", fontWeight: "bold"}}>PUT</span></MenuItem>
                         </Select>
                         <span style={{paddingLeft: "8px", fontWeight: "500"}}>{curData.url}</span>
                     </Box>
                     <Button color="success" variant="contained" style={{marginTop: "32px", height: "6vh", width: "5vw", marginLeft: "10px"}} onClick={toggleDrawer(anchor, true)}>Send</Button>
                 </div>
                 <div style={{display: "flex", justifyContent: "center" ,width: "85vw", height: "5vh"}}>
                         <Box sx={{ marginTop: "60px"}}>
                           <Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
                             <Tab label="Overview" {...a11yProps(0)} />
                             <Tab label="Headers" {...a11yProps(1)} />
                             <Tab label="Auth" {...a11yProps(2)} />
                             <Tab label="Body" {...a11yProps(3)} />
                           </Tabs>
                         </Box>
                </div>
                <CustomTabPanel value={value} index={0}>
                    <h1 style={{padding: "16px 32px", margin: "40px 120px 0px 120px"}}>{curData.name}</h1>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                         <div style={{width: "50vw", height: "5vh", borderRadius: "10px" , backgroundColor: "rgb(249, 249, 249)", display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <h4 style={{paddingLeft: "10px"}}>{`${baseurl + curData['url']}`}</h4>
                         </div>
                         <p style={{width: "60vw"}}>Verifies whether 3D Secure is available for the specified BIN or card brand. For 3D Secure 2, this endpoint also returns device fingerprinting keys.  For more information, refer to 3D <a>Secure 2.</a></p>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                         <h3 style={{borderBottom: "1px solid rgb(237, 237, 237)", width: "60vw"}}>
                             Body <span style={{color: "rgb(107, 107, 107)", fontSize: "14px", fontWeight: "normal"}}>edit to change value</span>
                         </h3>
        
                         <ReactJson src={formData()} displayObjectSize={false} displayDataTypes={false} iconStyle={"circle"} style={{fontWeight: "bold", width: "60vw"}} onEdit={(edit) => { console.log(edit) }}/>

                         <h3 style={{borderBottom: "1px solid rgb(237, 237, 237)", width: "60vw"}}>
                             Code Snippet <span style={{color: "rgb(107, 107, 107)", fontSize: "14px", fontWeight: "normal"}}></span>
                         </h3>
                         <div style={{width: "60vw"}}>
                            <CopyBlock
                                text={`curl --location "https://api.mistral.ai/v1/chat/completions"`}
                                language={`bash`}
                                showLineNumbers={true}
                                theme={github}
                                wrapline
                                style={{width: "60vw", fontSize: "4000px"}}
                            />
                        </div>
                        <SwipeableDrawer
                          anchor={anchor}
                          open={state[anchor]}
                          onClose={toggleDrawer(anchor, false)}
                          onOpen={toggleDrawer(anchor, true)}
                            >
                            <div style={{height: "40vh", margin: "60px 60px 60px 60px"}}>
                                <h1><center>Request Response (TEMP)</center></h1>
                                <ReactJson src={valueResponse} displayObjectSize={false} displayDataTypes={false} iconStyle={"circle"} style={{fontWeight: "bold", width: "60vw"}} onEdit={(edit) => { console.log(edit) }}/>

                            </div>
                        </SwipeableDrawer>
                    </div>
                </CustomTabPanel>

                </div>
            </div>
        </div>
    )

           // <div style={{display: "flex", borderRight: "1px solid black", width: "15%", height: "91vh"}}>
           // </div>
//    <div style={{"display": "flex", "flexDirection": "column", minminHeight: "100%"}}>
//        <div style={{"display": "flex",paddingLeft: "21px",alignItems: "center", widht: "100%", minHeight: "100%" ,backgroundColor: "red"}}>
//            <img alt={info.title} src={info["x-logo"] ? info["x-logo"] : `https://ui-avatars.com/api/?name=${info.title}`} width={60} minHeight={60} />
//            <h1 style={{paddingLeft: "5px"}}>
//                {info.title}
//            </h1>
//	</div>
//	<div style={{"display": "flex", "flexDirection": "row", minHeight: "100%"}}>
//            <div style={{"display": "flex", "flexDirection": "column", "width": "15%", backgroundColor: "yellow", padding: "10px"}}>
//            {actions.map((action, index)=> (
//                <button key={`${index}`} id="test" style={{marginTop: "10px"}} onClick={() => handleChange(index)}>
//                    {action.name}
//                </button>
//            ))}
//            </div>
//            <div style={{"display": "flex", "flexDirection": "colomn", backgroundColor: "pink", width: "100%", minHeight: "100%"}}>
//                <AppActions/>
//                <div style={{"width": "40%", paddingLeft: "80px"}}>
//                    <div style={{"display": "flex", "flexDirection": "colomn", justifyContent: "space-between"}}>
//                        <h3>SAMPLE REQUEST</h3>
//                        <button style={{
//                              minHeight: "30px",
//                              marginTop: "20px",
//                              padding: "0 20px",
//                              textAlign: "center",
//                              display: "inline-block",
//                              lineminHeight: "30px",
//                              verticalAlign: "middle"
//                            }}
//                        onClick={handleExecution}>
//                          Run
//                        </button>
//                    </div>
//                    <ReactJson src={formData()} theme="monokai" displayObjectSize={false} displayDataTypes={false} iconStyle={"circle"} style={{fontWeight: "bold"}} onEdit={(edit) => { console.log(edit) }}/>
//                    {isResponse ? <ProvideResponse /> : <div></div>}
//                </div>
//            </div>
//	</div>
//    </div>
}

export default ApiExplorer
