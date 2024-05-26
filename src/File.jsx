import { useState } from "react"
import { useNavigate } from "react-router-dom"


export default File = () => {

    const [fileContent, setFileContent] = useState('')
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileContent(event.target.result);
            }
            reader.readAsText(file);
        }
    }

    const submit = () => {
        navigate("/app/file", { state: fileContent })
    }

    return (
        <div>
            <input type="file" onChange={handleFileChange}></input> <br/>< br/>
            <button onClick={submit}>Submit</button>
        </div>
    )
}
