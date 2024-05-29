import {useState} from "react";

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


const ApiExplorer = ({actions, info, serverurl}) => {
    const [response, setResponse] = useState(undefined)
    const [data, setData] = useState(actions)
    const [remove, setRemove] = useState(info)
    const [baseurl, setBaseurl] = useState(serverurl)

    const handleExecution = () => {
        cUrl(`${baseurl + data[0]['url']}`, data[0]['method'], data[0]["body"])
    }


    return (
    <div style={{"display": "flex", "flexDirection": "column"}}>
        <div style={{"display": "flex",paddingLeft: "21px",alignItems: "center"}}>
            <img alt={info.title} src={info["x-logo"] ? '' : `https://ui-avatars.com/api/?name=${info.title}`} width={60} height={60} />
            <h1 style={{paddingLeft: "5px"}}>
                {info.title}
            </h1>
	</div>
	    <div style={{"display": "flex", "flexDirection": "row", "height": "80vh"}}>
            <div style={{"display": "flex", "flexDirection": "column", "width": "15%", backgroundColor: "yellow"}}>
            {actions.map((action)=> (
                <button key={`${action.name}`} id="test" style={{marginTop: "10px"}}>
                    {action.name}
                </button>
            ))}
            </div>
            <button style={{"backgroundColor": "red", "height": "40px", "marginLeft": "40px", marginTop: "10px"}} onClick={handleExecution}>
                    Run
            </button>
	    </div>
	</div>
    )
}

export default ApiExplorer
