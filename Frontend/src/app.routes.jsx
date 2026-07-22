import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Report from "./features/interview/pages/Report";
import Practice from "./features/interview/pages/Practice";
import ResumeBuilder from "./features/interview/pages/ResumeBuilder";
import ResumeFormPage from "./features/interview/pages/ResumeFormPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/reports/:id",
        element: <Protected><Report /></Protected>
    },
    {
        path: "/practice",
        element: <Protected><Practice /></Protected>
    },
    {
        path: "/reports/:id/tailor",
        element: <Protected><ResumeBuilder /></Protected>
    },
    {
        path: "/resume-builder",
        element: <Protected><ResumeFormPage /></Protected>
    },
    {
        path: "/resume-builder/preview",
        element: <Protected><ResumeBuilder /></Protected>
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])


