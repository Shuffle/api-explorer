import { useState } from "react"
import { useParams } from "react-router-dom"

const Devs = () => {
    const v = useParams()
    const [values, setValues] = useState()

    const getValues = (appId) => {
        const value = fetch("https://shuffler.io/api/v1/get_openapi/7ea4a8ac1dbc114c3f67e1e47dd87cc4", {
            method: "GET",
            cors: "cors",
            headers: {
                "Authorization" : "Bearer 8e3b8ce4-7a08-4c25-bf18-548b47787720",
            }
        }).
            then((resp) => {
                console.log(resp)
            })
    }
    getValues(v.id)
    console.log(v.id)
    return (
        <div>
            {v.id}
        </div>
    )
}

export default Devs
