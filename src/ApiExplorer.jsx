import {useState, useEffect} from "react";

const cUrl = async (url, method, data) => {
    const values = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    return values
}

const ApiExplorer = ({actions, info, serverurl, moredata}) => {
    const [response, setResponse] = useState(undefined)
    const [data, setData] = useState(actions)
    const [curData, setCurData] = useState(data[0])
    const [remove, setRemove] = useState(info)
    const [baseurl, setBaseurl] = useState(serverurl)

    const handleExecution = () => {
        cUrl(`${baseurl + curData['url']}`, curData['method'], curData["body"])
    }
    //name
    const handleChange = (index) => {
        console.log(moredata[data[index].name] ? moredata[data[index].name] : data[index])
        setCurData(data[index])
    }

    const AppActions = () => {
      return (
         // <button style={{"backgroundColor": "red", "height": "40px", "marginLeft": "40px", marginTop: "10px"}} onClick={handleExecution}>
         //     Run
         // </button>
         <div style={{marginLeft: "20px", width: "50%"}}>
         <h2>
          {curData.name}
         </h2>
          <h4 style={{ color: "black" }}>Paramerters</h4>
          {Object.entries(moredata[curData.name].properties).map(([key, value]) => (
            <div style={{ marginLeft: "15px" }}>
                <pre>{key}</pre>
                <p>{value.description}</p>
                <hr style={{ border: "1px solid #213547" }}/>
            </div>
           ))}
          </div>

      )
    }



    // Click work?
//    useEffect(() => {
//        console.log(curData)
//    }, [curData])


    return (
    <div style={{"display": "flex", "flexDirection": "column"}}>
        <div style={{"display": "flex",paddingLeft: "21px",alignItems: "center", widht: "100%", backgroundColor: "red"}}>
            <img alt={info.title} src={info["x-logo"] ? '' : `https://ui-avatars.com/api/?name=${info.title}`} width={60} height={60} />
            <h1 style={{paddingLeft: "5px"}}>
                {info.title}
            </h1>
	</div>
	<div style={{"display": "flex", "flexDirection": "row"}}>
            <div style={{"display": "flex", "flexDirection": "column", "width": "15%", backgroundColor: "yellow", padding: "10px"}}>
            {actions.map((action, index)=> (
                <button key={`${index}`} id="test" style={{marginTop: "10px"}} onClick={() => handleChange(index)}>
                    {action.name}
                </button>
            ))}
            </div>
            <div style={{"display": "flex", "flexDirection": "colomn", height: "100%", width: "100%", backgroundColor: "pink"}}>
                <AppActions/>
            </div>
	</div>
    </div>
    )
}

export default ApiExplorer
