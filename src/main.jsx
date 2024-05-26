import React from 'react'
import ReactDOM from 'react-dom/client'
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"
import App from './App.jsx'
import './index.css'
import ErrorPage from './error.jsx'
import Devs from './Devs.jsx'
import File from './File.jsx'
import FileHandle from './FileHandle.jsx'


const router = createBrowserRouter([
    {
        path: "/apps/:id",
        element: <Devs />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/app",
        element: <File />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/app/file",
        element: <FileHandle/>,
        errorElement: <ErrorPage />,
    },
])


ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)
