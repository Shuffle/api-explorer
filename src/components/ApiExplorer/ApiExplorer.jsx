import React, { useState, useEffect } from 'react';
import { CopyBlock, github } from 'react-code-blocks';
import ReactJson from 'react-json-view';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import TextField from '@mui/material/TextField';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Input from '@mui/joy/Input';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Sheet from '@mui/joy/Sheet';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import TableRow from '@mui/material/TableRow';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";


const cUrl = async (url, headers, method, data) => {
    const values = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(data)
    })
    return values
}

function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const BodyEditor = ({ formData }) => (
    <CodeMirror value={JSON.stringify(formData, null, 4)} height="100%" extensions={json()} />
);

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

const HeaderTable = ({ rows, setRows, handleInputChange, addRow, curIndex }) => (
    <TableContainer style={{border: "1px solid #EDEDED"}}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell style={{border: "1px solid #ededed"}}>Key</TableCell>
            <TableCell style={{border: "1px solid #ededed"}}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell style={{border: "1px solid #ededed"}}>
                <input
                  type="text"
                  value={row.key}
                  style={{padding: "10px 10px", border: "0"}}
                  onChange={(e) => handleInputChange(curIndex, index, 'key', e.target.value, setRows, rows)}
                />
              </TableCell>
              <TableCell style={{border: "1px solid #ededed"}}>
                <input
                  type="text"
                  value={row.value}
                  style={{padding: "10px 10px", border: "0"}}
                  onChange={(e) => handleInputChange(curIndex, index, 'value', e.target.value, setRows, rows)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => { addRow(setRows, rows) }} variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Add Row
      </Button>
    </TableContainer>
  );


  const ParamsTable = ({ paramRows, setParamRows, handleInputChange, addRow, curIndex }) => (
    <TableContainer component={Paper} style={{ margin: "" }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paramRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) => handleInputChange(curIndex, index, 'key', e.target.value, setParamRows, paramRows)}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => handleInputChange(curIndex, index, 'value', e.target.value, setParamRows, paramRows)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => { addRow(setParamRows, paramRows) }} variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Add Row
      </Button>
    </TableContainer>
  );
  


const ApiExplorer = ({ actions, info, serverurl, moredata }) => {
    const [data, setData] = useState(actions);
    const [curDataIndex, setCurDataIndex] = useState(0);
    const [baseurl, setBaseurl] = useState(serverurl);
    const [tabValues, setTabValues] = useState({});
    const [reqUrl, setReqUrl] = useState([]);
    const [headerRows, setHeaderRows] = useState(actions.map(() => [{ key: '', value: '' }]));
    const [paramRows, setParamRows] = useState(actions.map(() => [{ key: '', value: '' }]));
    const [query, setQuery] = useState('');

    useEffect(() => {
        const initialTabValues = {};
        const urls = data.map(item => item.url);
        data.forEach((_, i) => {
            initialTabValues[`tab-set-${i}`] = 0;
        });
        setTabValues(initialTabValues);
        setReqUrl(urls);
    }, [data]);

    const addRow = (setRow, row) => {
        setRow([...row, { key: '', value: '' }]);
    };

    const handleInputChange = (apiIndex, index, field, value, setRow, row) => {
        const newRows = [...row];
        newRows[index][field] = value;
        setRow(newRows);
        if (setRow === setParamRowsForIndex) {
            updateQueryString(newRows, apiIndex);
        }
    };

    const updateQueryString = (rows, apiIndex) => {
        const queryString = rows.filter(row => row.key && row.value).map(row => `${encodeURIComponent(row.key)}=${encodeURIComponent(row.value)}`).join('&');
        setQuery(queryString);
        setReqUrl(prevItems => {
            const newItems = [...prevItems];
            newItems[apiIndex] = queryString ? `${data[apiIndex].url}?${queryString}` : data[apiIndex].url;
            return newItems;
        });
    };

    const setParamRowsForIndex = (index, rows) => {
        setParamRows(prevParamRows => {
            const newParamRows = [...prevParamRows];
            newParamRows[index] = rows;
            return newParamRows;
        });
    };

    const setHeaderRowsForIndex = (index, rows) => {
        setHeaderRows(prevHeaderRows => {
            const newHeaderRows = [...prevHeaderRows];
            newHeaderRows[index] = rows;
            return newHeaderRows;
        });
    };

    const handleExecution = (url, data, index) => {
        const value = cUrl(`${baseurl + url}`, genrateHeaders(index), data['method'], formData(index));
        value.then(response => response.json()).then(data => setIsResponse(data));
    };

    const genrateHeaders = (index) => {
        const rows = headerRows[index];
        return rows.reduce((acc, row) => {
            if (row.key && row.value) {
                acc[row.key] = row.value;
            }
            return acc;
        }, {});
    };

    const formData = (index) => {
        const val = {};
        if (moredata[data[index].name] !== undefined) {
            Object.entries(moredata[data[index].name].properties).forEach(([key, value]) => {
                val[key] = value.example || value.default;
            });
        }
        if (Object.keys(val).length === 0 && val.constructor === Object) {
            try {
                return JSON.parse(data[index].body);
            } catch (e) {
                return {};
            }
        }
        return val;
    };

    const handleChangeTab = (event, newValue, tabSetKey) => {
        setTabValues(prevValues => ({
            ...prevValues,
            [tabSetKey]: newValue
        }));
    };

    return (
        <div>
            <div style={{display: "flex", paddingLeft: "21px", borderBottom: "1px solid black", position: "sticky"}}>
                <h1 style={{paddingLeft: "5px"}}>
                    Shuffle - {info.title}
                </h1>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    <Paper style={{display: "flex", flexDirection: "column", width: "15vw", position: "sticky", top: 0}}>
                        <ButtonGroup orientation="vertical" variant="text">
                            {actions.map((action, index) => (
                                <Button key={index} style={{padding: "15px 0px 15px 0px", color: "#212121", fontWeight: "normal"}} onClick={() => setCurDataIndex(index)}>
                                    <span style={{color: "green", fontSize: "12px", paddingRight: "10px", fontWeight: "bold"}}>{action.method}</span>
                                    {action.name}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Paper>
                </div>
                <div style={{display: "flex", flexDirection: "column"}}>
                    {data.map((val, index) => (
                        <div key={index} style={{display: "flex", flexDirection: "row", paddingTop: index === 0 ? "20px" : "80px", borderTop: index === 0 ? "0" : "1px solid black", paddingBottom: "80px"}}>
                            <div style={{width: "40vw", marginLeft: "40px"}}>
                                <h1>{data[index].name}</h1>
                                <p style={{marginLeft: "5px"}}>{val.description}</p>
                                {moredata[val.name] && moredata[val.name].properties ? (
                                    <>
                                        <span style={{fontSize: "18px", fontWeight: "600"}}>Attribute</span>
                                        <hr />
                                    </>
                                ) : null}
                                {moredata[val.name] && moredata[val.name].properties ? (
                                    Object.entries(moredata[val.name].properties).map(([key, value]) => (
                                        <div key={key} style={{ marginLeft: "15px" }}>
                                            <pre><b>{key}</b> <span style={{color: "grey"}}>{value.type}</span></pre>
                                            <p style={{ marginLeft: "19px" }}>{value.description}</p>
                                            <hr />
                                        </div>
                                    ))
                                ) : null}
                            </div>
                            <div style={{display: "flex", flexDirection: "column", position: "sticky", top: 0}}>
                                <Sheet variant="outlined" sx={{borderRadius: "md", display: "flex", gap: 2, p: 0.5, marginTop: index === 0 ? "20px" : "0px", width: "38.5vw", marginLeft: "40px", position: "sticky", top: 0}}>
                                    <Select variant="outlined" defaultValue={val.method} sx={{marginRight: 0, color: "green"}}>
                                        <Option value={val.method} style={{color: "green"}}>{val.method}</Option>
                                    </Select>
                                    <Input variant="plain" size="lg" value={reqUrl[index]} sx={{ margin: 0, padding: 1, width: "28vw"}}/>
                                    <Button variant="contained" sx={{backgroundColor: "green"}} onClick={() => handleExecution(val.url, val, index)}>Send</Button>
                                </Sheet>
                                <Paper style={{backgroundColor: "white", height: "80vh", width: "39vw", marginTop: "40px", marginLeft: "40px", position: "sticky", top: "57px", bottom: 0}}>
                                    <div>
                                        <div style={{display: "flex", justifyContent: "center"}}>
                                            <Tabs value={tabValues[`tab-set-${index}`]} onChange={(event, newValue) => handleChangeTab(event, newValue, `tab-set-${index}`)} aria-label="basic tabs example">
                                                <Tab label="Header" />
                                                <Tab label="Body" />
                                                <Tab label="Params" />
                                            </Tabs>
                                        </div>
                                        <CustomTabPanel value={tabValues[`tab-set-${index}`]} index={0}>
                                            <HeaderTable rows={headerRows[index]} setRows={(rows) => setHeaderRowsForIndex(index, rows)} handleInputChange={handleInputChange} addRow={addRow} curIndex={index} />
                                        </CustomTabPanel>
                                        <CustomTabPanel value={tabValues[`tab-set-${index}`]} index={1} style={{height: "100%"}}>
                                            <BodyEditor formData={formData(index)} />
                                        </CustomTabPanel>
                                        <CustomTabPanel value={tabValues[`tab-set-${index}`]} index={2}>
                                            <ParamsTable paramRows={paramRows[index]} setParamRows={(rows) => setParamRowsForIndex(index, rows)} handleInputChange={handleInputChange} addRow={addRow} curIndex={index} />
                                        </CustomTabPanel>
                                    </div>
                                </Paper>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApiExplorer;