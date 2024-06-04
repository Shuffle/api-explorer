import {useState, useEffect} from "react";
import { CopyBlock, dracula } from 'react-code-blocks';

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

function MyCoolCodeBlock({ code, language, showLineNumbers }) {

    return (
    <CopyBlock
        text={code}
        language={language}
        showLineNumbers={showLineNumbers}
        theme={dracula}
        codeBlock
    />
    )
}

const ApiExplorer = ({actions, info, serverurl, moredata}) => {
    const [response, setResponse] = useState(undefined)
    const [data, setData] = useState(actions)
    const [curData, setCurData] = useState(data[0])
    const [remove, setRemove] = useState(info)
    const [baseurl, setBaseurl] = useState(serverurl)
    const [isResponse, setIsResponse] = useState(false)

    console.log(info)

    const handleExecution = () => {
        cUrl(`${baseurl + curData['url']}`, curData['method'], formData())
        setIsResponse(true)

    }
    //name
    const handleChange = (index) => {
        console.log(moredata[data[index].name] ? moredata[data[index].name] : data[index])
        setCurData(data[index])
    }

    const ProvideResponse = () => {
        return (
            <div>
                Hello
            </div>
        )
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
    <div style={{"display": "flex", "flexDirection": "column", minminHeight: "100%"}}>
        <div style={{"display": "flex",paddingLeft: "21px",alignItems: "center", widht: "100%", minHeight: "100%" ,backgroundColor: "red"}}>
            <img alt={info.title} src={info["x-logo"] ? info["x-logo"] : `https://ui-avatars.com/api/?name=${info.title}`} width={60} minHeight={60} />
            <h1 style={{paddingLeft: "5px"}}>
                {info.title}
            </h1>
	</div>
	<div style={{"display": "flex", "flexDirection": "row", minHeight: "100%"}}>
            <div style={{"display": "flex", "flexDirection": "column", "width": "15%", backgroundColor: "yellow", padding: "10px"}}>
            {actions.map((action, index)=> (
                <button key={`${index}`} id="test" style={{marginTop: "10px"}} onClick={() => handleChange(index)}>
                    {action.name}
                </button>
            ))}
            </div>
            <div style={{"display": "flex", "flexDirection": "colomn", backgroundColor: "pink", width: "100%", minHeight: "100%"}}>
                <AppActions/>
                <div style={{"width": "37%", paddingLeft: "80px"}}>
                    <div style={{"display": "flex", "flexDirection": "colomn", justifyContent: "space-between"}}>
                        <h3>SAMPLE REQUEST</h3>
                        <button style={{
                              minHeight: "30px",
                              marginTop: "20px",
                              padding: "0 20px",
                              textAlign: "center",
                              display: "inline-block",
                              lineminHeight: "30px",
                              verticalAlign: "middle"
                            }}
                        onClick={handleExecution}>
                          Run
                        </button>
                    </div>
                    <MyCoolCodeBlock code={genCode()} language={`shell`} showLineNumbers={true} />
                    {isResponse ? <ProvideResponse /> : <div></div>}
                </div>
            </div>
	</div>
    </div>
    )
}

export default ApiExplorer
